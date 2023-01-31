const argon2 = require('argon2');
const crypto = require('crypto');
const pool = require('../db.js');

async function getPage(page, size) {
    const total = +((await pool.query(
        'SELECT COUNT(*) as num FROM users'
    )).rows[0].num);
    const res = await pool.query(
        'SELECT * FROM users OFFSET $1 LIMIT $2',
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
        'SELECT * FROM users WHERE "id" = $1',
        [id]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function getByIdClean(id) {
    const res = await pool.query(
        `SELECT "id", "role", "email", "nameFirst", "nameLast", "birthday", "addressLine1", "addressLine2", "addressPostcode", "addressTown", "addressState", "addressCountry" FROM users WHERE "id" = $1`,
        [id]
    );

    return res.rows[0];
}

async function getByCredentials(email, password) {
    const res = await pool.query(
        'SELECT "id", "role", "password", "email", "confirmed" FROM users u INNER JOIN user_confirmations c ON u."id" = c."userId" WHERE "email" = $1',
        [email]
    );

    if (res.rowCount != 1) {
        return null;
    }

    const user = res.rows[0];
    const valid = await argon2.verify(user.password, password);

    return valid ? user : null;
}

async function getConfirmationData(userId, withKey = false) {
    const res = await pool.query(
        `SELECT "userId", ${withKey ? '"key",' : ''} "confirmed", "sentAt", "confirmedAt" FROM user_confirmations WHERE "userId" = $1`,
        [userId]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function add(role, email, password, nameFirst, nameLast, birthday = null, addressLine1 = '', addressLine2 = '', addressPostcode = '', addressTown = '', addressState = '', addressCountry = '') {
    const hashed_password = await argon2.hash(password);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userRes = await client.query(
            'INSERT INTO users ("role", "email", "password", "nameFirst", "nameLast", "birthday", "addressLine1", "addressLine2", "addressPostcode", "addressTown", "addressState", "addressCountry") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [role, email, hashed_password, nameFirst, nameLast, birthday, addressLine1, addressLine2, addressPostcode, addressTown, addressState, addressCountry]
        );
        const user = userRes.rows[0];
        const key = crypto.randomBytes(48).toString('hex');

        await client.query(
            'INSERT INTO user_confirmations ("userId", "key") VALUES ($1, $2)',
            [user.id, key]
        );

        await client.query('COMMIT');

        user.key = key;

        return user;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function update(user) {
    const res = await pool.query(
        'UPDATE users SET "role" = $2, "email" = $3, "nameFirst" = $4, "nameLast" = $5, "birthday" = $6, "addressLine1" = $7, "addressLine2" = $8, "addressPostcode" = $9, "addressTown" = $10, "addressState" = $11, "addressCountry" = $12 WHERE "id" = $1 RETURNING *',
        [user.id, user.role, user.email, user.nameFirst, user.nameLast, user.birthday, user.addressLine1, user.addressLine2, user.addressPostcode, user.addressTown, user.addressState, user.addressCountry]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function password(user, password) {
    const hashed_password = await argon2.hash(password);
    const res = await pool.query(
        'UPDATE users SET password = $2 WHERE id = $1 RETURNING *',
        [user.id, hashed_password]
    );

    return res.rowCount == 1 ? res.rows[0] : null;
}

async function passwordSafe(id, oldPassword, newPassword) {
    const res = await pool.query(
        'SELECT "id", "password" FROM users WHERE "id" = $1',
        [id]
    );

    if (res.rowCount != 1) {
        return null;
    }

    if (! (await argon2.verify(res.rows[0].password, oldPassword))) {
        return false;
    }

    await password(res.rows[0], newPassword);

    return true;
}

async function confirm(userId, key) {
    const res = await pool.query(
        'UPDATE user_confirmations SET "confirmed" = TRUE, "confirmedAt" = CURRENT_TIMESTAMP WHERE "userId" = $1 AND "key" = $2 RETURNING *',
        [userId, key]
    );

    return res.rowCount == 1;
}

async function remove(id) {
    const res = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
    );

    return res.rowCount == 1;
}

module.exports = { getPage, getById, getByIdClean, getByCredentials, getConfirmationData, add, update, password, passwordSafe, confirm, remove };
