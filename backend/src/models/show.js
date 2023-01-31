const pool = require('../db.js');

async function getPage(page, size, sortProp, sortDir) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as num FROM shows'
    )).rows[0].num);
    const res = await pool.query(
        `
            SELECT
                *,
                (
                    SELECT COUNT(*)
                    FROM seats se
                    WHERE
                        (
                            SELECT COUNT(*)
                            FROM tickets ti
                            WHERE ti."showId" = sh.id AND ti."seatId" = se."id"
                        ) < 1
                ) as "freeSeats"
            FROM shows sh
            WHERE
                sh."movieId" = $1
                AND
                date_part('week', sh."startsAt") = $2
                AND
                date_part('year', sh."startsAt") = $2
            ${
                ['startsAt'].indexOf(sortProp) >= 0
                    ? `SORT BY "${sortProp}" ${sortDir == 'asc' ? 'asc' : 'desc'}`
                    : ''
            }
            OFFSET $1
            LIMIT $2
        `,
        [(page - 1) * size, size]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function getByMovie(movieId, date) {
    const res = await pool.query(
        `
            SELECT
                *,
                (
                    SELECT COUNT(*)
                    FROM seats se
                    WHERE
                        (
                            SELECT COUNT(*)
                            FROM tickets ti
                            WHERE ti."showId" = sh.id AND ti."seatId" = se."id"
                        ) < 1
                ) as "freeSeats"
            FROM shows sh
            WHERE
                sh."movieId" = $1
                AND
                date_part('week', sh."startsAt") = date_part('week', $2::date)
                AND
                date_part('year', sh."startsAt") = date_part('year', $2::date)
        `,
        [movieId, date]
    );

    return res.rows;
}

async function getById(id) {
    const res = await pool.query(
        `SELECT * FROM shows WHERE "id" = $1`,
        [id]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function add(movieId, theaterId, variant, startsAt) {
    const res = await pool.query(
        'INSERT INTO shows ("variant", "startsAt", "movieId", "theaterId") VALUES ($1, $2, $3, $4) RETURNING *',
        [JSON.stringify(variant), startsAt, movieId, theaterId]
    );

    return res.rows[0];
}

async function update(show) {
    const res = await pool.query(
        'UPDATE shows SET "variant" = $2, "startsAt" = $3, "theaterId" = $4 WHERE "id" = $1 RETURNING *',
        [show.id, JSON.stringify(show.variant), show.startsAt, show.theaterId]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function remove(showId) {
    const res = await pool.query(
        'DELETE FROM shows WHERE "id" = $1',
        [showId]
    );

    return res.rowCount == 1;
}

async function exists(movieId, showId) {
    const count = +((await pool.query(
        `SELECT COUNT(*) as num FROM shows WHERE "movieId" = $1 AND "showId" = $2`,
        [movieId, showId]
    )).rows[0].num);

    return count > 0;
}

module.exports = { exists, getPage, getByMovie, getById, add, update, remove };
