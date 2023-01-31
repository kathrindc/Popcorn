const pool = require('../db.js');

async function getPage(page, size) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as "num" FROM theaters'
    )).rows[0].num);
    const res = await pool.query(
        'SELECT * FROM theaters OFFSET $1 LIMIT $2',
        [(page - 1) * size, size]
    );

    return {
        total_records: total,
        total_pages: Math.ceil(total / size),
        page: page,
        records: res.rows,
    };
}

async function getById(id) {
    const res = await pool.query(
        'SELECT * FROM theaters WHERE "id" = $1',
        [id]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function add(name, features) {
    const res = await pool.query(
        'INSERT INTO theaters ("name", "features") VALUES ($1, $2) RETURNING *',
        [name, JSON.stringify(features)]
    );

    return res.rows[0];
}

async function update(theater) {
    const res = await pool.query(
        'UPDATE theaters SET "name" = $2, "features" = $3 WHERE "id" = $1 RETURNING *',
        [theater.id, theater.name, JSON.stringify(theater.features)]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function remove(id) {
    const res = await pool.query(
        'DELETE FROM theaters WHERE "id" = $1 RETURNING *',
        [id]
    );

    return res.rowCount == 1;
}

async function exists(id) {
    const res = await pool.query(
        'SELECT "id" FROM "id" = $1',
        [id]
    );

    return res.rowCount == 1;
}

module.exports = { getPage, getById, exists, add, update, remove };
