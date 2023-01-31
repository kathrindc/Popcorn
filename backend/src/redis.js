const redis = require('redis');

const connectionString = process.env.REDIS_URI;

if (!connectionString) {
    console.error('Environment variable REDIS_URI is missing');
    process.exit(1);
}

const client = redis.createClient({ url: connectionString });

client.configure = async function (fastify) {
    client.on('error', (err) => fastify.log.error(err));

    await client.connect();
    await client.info('server');
};

module.exports = client;
