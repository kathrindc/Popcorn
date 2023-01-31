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
    const res = await pool.query(
        `SELECT *, ((SELECT COUNT(*) FROM tickets t WHERE t."showId" = $1 AND t."seatId" = s."id") < 1) as "isFree" FROM seats s WHERE s."theaterId" = $2`,
        [showId, theaterId]
    );

    return res.rows;
}

async function getById(theaterId, seatId) {
    const res = await pool.query(
        'SELECT * FROM seats WHERE theaterId = $1 AND id = $2',
        [theaterId, seatId]
    );

    return res.rowCount == 1 ? res.rows : null;
}

async function add(displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId) {
    const res = await pool.query(
        'INSERT INTO seats (displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [displayNum, displayX, displayY, flagDeluxe, flagWheelchair, theaterId]
    );

    return res.rows[0];
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

module.exports = { getByTheater, getByShow, getById, isFree, add, update, remove };
