const pool = require('../db.js');

async function getPage(page, size) {
    const total = +((await pool.query(
        `SELECT COUNT(*) as "num" FROM orders`
    )).rows[0].num);
    const res = await pool.query(
        `SELECT * FROM orders OFFSET $1 LIMIT $2`,
        [(page - 1) * size, size]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function getPageByUser(page, size, userId) {
    const total = +((await pool.query(
        `SELECT COUNT(*) as num FROM orders WHERE "userId" = $1`,
        [userId]
    )).rows[0].num);
    const res = await pool.query(
        `SELECT "id", "complete", "submittedAt", "completedAt" FROM orders WHERE "userId" = $3 OFFSET $1 LIMIT $2`,
        [(page - 1) * size, size, userId]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function getById(orderId) {
    const orderRes = await pool.query(
        `SELECT * FROM orders WHERE "id" = $1`,
        [orderId],
    )

    if (orderRes.rowCount != 1) {
        return null;
    }

    const order = orderRes.rows[0];
    const ticketsRes = await pool.query(
        `SELECT t."showId" as "showId", t."seatId" as "seatId", s."movieId" as "movieId", m."name" as "movieName" FROM tickets t LEFT JOIN shows s ON t."showId" = s."id" LEFT JOIN movies m ON s."movieId" = m."id" WHERE t."orderId" = $1`,
        [orderId]
    );

    order.tickets = ticketsRes.rows;

    return order;
}

async function add(userId, items) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const order = (await client.query(
            `INSERT INTO orders ("userId") VALUES ($1) RETURNING *`,
            [userId]
        )).rows[0];

        order.tickets = [];

        for (let item of items) {
            for (let seatId of item.seats) {
                const ticket = (await client.query(
                    `INSERT INTO tickets ("orderId", "showId", "seatId") VALUES ($1, $2, $3) RETURNING "id", "showId", "seatId"`,
                    [order.id, item.showId, seatId]
                )).rows[0];

                order.tickets.push(ticket);
            }
        }

        await client.query('COMMIT');

        return order;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function remove(ticketId) {
    const res = pool.query(
        `DELETE FROM tickets WHERE "id" = $1`,
        [ticketId]
    );

    if (res.rowCount != 1) {
        throw new errors.NotFoundError('ticket not found');
    }
}

module.exports = { getPage, getPageByUser, getById, add, remove };
