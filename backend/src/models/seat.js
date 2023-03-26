const pool = require('../db.js');
const redis = require('../redis.js');

async function getByTheater(theaterId) {
    const res = await pool.query(
        'SELECT * FROM seats WHERE "theaterId" = $1',
        [theaterId]
    );

    return res.rows;
}

async function getByShow(showId, theaterId) {
    const ticketsResult = await pool.query(
        `SELECT *, ((SELECT COUNT(*) FROM tickets t WHERE t."showId" = $1 AND t."seatId" = s."id") < 1) as "isFree" FROM seats s WHERE s."theaterId" = $2`,
        [showId, theaterId]
    );
    const lockPrefix = `lock.${showId}.`;
    const bounced = {}; 

    for await (let key of redis.scanIterator({ pattern: `${lockPrefix}*` })) {
        const sub = key.replace(lockPrefix, '');

        if (!isNaN(sub)) {
            bounced[parseInt(sub)] = true;
        }
    }

    for (let i = 0; i < ticketsResult.rows.length; ++i) {
        if (bounced[ticketsResult.rows[i].id]) {
            ticketsResult.rows[i].isFree = false;
        }
    }

    return ticketsResult.rows;
}

async function getById(theaterId, seatId) {
    const res = await pool.query(
        'SELECT * FROM seats WHERE theaterId = $1 AND id = $2',
        [theaterId, seatId]
    );

    return res.rowCount == 1 ? res.rows : null;
}

async function _doAdd(connection, displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId) {
    const res = await connection.query(
        'INSERT INTO seats (displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId]
    );

    return res.rows[0];
}

async function add(displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId) {
    return _doAdd(pool, displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId);
}

async function batchAdd(seats) {
    const client = await pool.connect();
    const results = [];

    try {
        await client.query('BEGIN');

        for (let seat of seats) {
            const result = await _doAdd(
                client,
                seat.displayNum,
                seat.displayX,
                seat.displayY,
                seat.flagDeluxe,
                seat.flagWheelchair,
                seat.theaterId
            );

            results.push(result);
        }
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function update(theaterId, seat) {
    const res = await pool.query(
        'UPDATE seats SET displayNum = $3, displayX = $4, displayY = $5, flagDeluxe = $6, flagWheelchair = $7 WHERE theaterId = $1 AND id = $2',
        [theaterId, seat.id, seat.displayNum, seat.displayX, seat.displayY, seat.flagDeluxe, seat.flagWheelchair]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function remove(theaterId, seatId) {
    const res = await pool.query(
        'DELETE FROM seats WHERE theaterId = $1 AND id = $2 RETURNING *',
        [theaterId, seatId]
    );

    return res.rowCount == 1;
}

async function isFree(showId, theaterId, seatId) {
    const seatRes = await pool.query(
        'SELECT "id" FROM seats WHERE "id" = $1 AND "theaterId" = $2',
        [seatId, theaterId]
    );

    if (seatRes.rowCount != 1) {
        return false;
    }

    const orderRes = await pool.query(
        'SELECT "seatId" FROM tickets WHERE "showId" = $1 AND "seatId" = $2',
        [showId, seatId]
    );

    if (orderRes.rowCount > 0) {
        return false;
    }

    return ! (
        await redis.get(`lock.${showId}.${seatId}`)
    );
}

module.exports = { getByTheater, getByShow, getById, isFree, add, batchAdd, update, remove };
