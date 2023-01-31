const pool = require('../db.js');

async function getPage(include_inactive, page, size) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as num FROM movies' + (include_inactive ? '' : ' WHERE (SELECT COUNT(*) FROM shows WHERE shows."movieId" = movies."id") > 0')
    )).rows[0].num);
    const res = await pool.query(
        'SELECT "id", "name", "minimumAge", "releasedAt", "posterUrl" FROM movies' + (include_inactive ? '' : ' WHERE (SELECT COUNT(*) FROM shows WHERE shows."movieId" = movies."id") > 0') + ' OFFSET $1 LIMIT $2',
        [(page - 1) * size, size]
    );

    return {
        totalRecords: total,
        totalPages: Math.ceil(total / size),
        currentPage: page,
        records: res.rows,
    };
}

async function getById(id) {
    const res = await pool.query(
        'SELECT * FROM movies WHERE "id" = $1',
        [id]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function exists(id) {
    return (+((await pool.query(
        'SELECT COUNT(*) as "num" FROM movies WHERE "id" = $1',
        [id]
    )).rows[0].num)) == 1;
}

async function add(name, description, duration, minimumAge, releasedAt, posterUrl, imdbUrl) {
    const res = await pool.query(
        'INSERT INTO movies ("name", "description", "duration", "minimumAge", "releasedAt", "posterUrl", "imdbUrl") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, description, duration, minimumAge, releasedAt, posterUrl, imdbUrl]
    );

    return res.rows[0];
}

async function update(movie) {
    const res = await pool.query(
        'UPDATE movies SET "name" = $2, "description" = $3, "duration" = $4, "minimumAge" = $5, "releasedAt" = $6, "posterUrl" = $7, "imdbUrl" = $8 WHERE "id" = $1 RETURNING *',
        [movie.id, movie.name, movie.description, movie.duration, movie.minimumAge, movie.releasedAt, movie.posterUrl, movie.imdbUrl]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function remove(movieId) {
    const res = await pool.query(
        'DELETE FROM movies WHERE "id" = $1',
        [+movieId]
    );

    return res.rowCount == 1;
}

module.exports = { exists, getPage, getById, add, update, remove };
