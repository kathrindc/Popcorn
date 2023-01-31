const pg = require('pg');

const connectionString = process.env.DATABASE_URI;

if (!connectionString) {
    console.error('Environment variable DATABASE_URI is missing');
    process.exit(1);
}

const pool = new pg.Pool({ connectionString });

pool.verifyConnection = async function () {
    await pool.query('SELECT NOW()');
}

pool.driver = pg;

module.exports = pool;
