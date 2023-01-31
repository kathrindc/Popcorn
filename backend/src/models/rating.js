const pool = require('../db.js');

async function getPage(page, size) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as num FROM ratings'
    )).rows[0].num);
    const res = await pool.query(
        'SELECT "id", "movieId", "userId", "stars", "content" FROM ratings OFFSET $1 LIMIT $2',
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
        'SELECT COUNT(*) as num FROM ratings WHERE userId = $1',
        [userId]
    )).rows[0].num);
    const res = await pool.query(
        'SELECT "id", "movieId", "userId", "stars", "content" FROM ratings WHERE "userId" = $3 OFFSET $1 LIMIT $2',
        [(page - 1) * size, size, userId]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function getPageByMovie(page, size, movieId) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as num FROM ratings WHERE "movieId" = $1',
        [movieId]
    )).rows[0].num);
    const res = await pool.query(
        'SELECT "id", "movieId", "userId", "stars", "content" FROM ratings WHERE "userId" = $3 OFFSET $1 LIMIT $2',
        [(page - 1) * size, size, movieId]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function whoOwns(ratingId) {
    const res = await pool.query(
        'SELECT "userId" FROM ratings WHERE "id" = $1',
        [ratingId]
    );

    return res.rowCount == 1 ? res.rows[0].userId : null;
}

async function add(movieId, userId, stars, content) {
    const res = await pool.query(
        'INSERT INTO ratings ("movieId", "userId", "stars", "content") VALUES ($1, $2, $3, $4) RETURNING *',
        [movieId, userId, stars, content]
    );

    return res.rows[0];
}

async function remove(ratingId) {
    const res = await pool.query(
        'DELETE FROM ratings WHERE "id" = $1 RETURNING *',
        [ratingId]
    );

    return res.rowCount == 1;
}

module.exports = { getPage, getPageByUser, getPageByMovie, whoOwns, add, remove };