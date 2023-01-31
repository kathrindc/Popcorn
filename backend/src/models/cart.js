const redis = require('../redis.js');

const CartTimeout = 15 * 60; // 15 minutes

async function get(userId) {
    const cartKey = 'cart.' + userId;
    const cart = await redis.hGetAll(cartKey);

    if (! cart || Object.keys(cart) < 1) {
        return null;
    }

    const ttl = await redis.ttl(cartKey);
    const expiry = new Date(Date.now() + (ttl * 1000)).toISOString();
    let items = [];

    for (let showId in cart) {
        const seats = cart[showId].split('&');

        items.push({ showId, seats });
    }

    return { expiry, items };
}

async function addTo(userId, showId, seats) {
    const cartKey = 'cart.' + userId;
    let commandQueue = redis
        .multi()
        .hSet(
            cartKey,
            `${showId}`,
            seats.join('&')
        )
        .expire(
            cartKey,
            CartTimeout,
            'NX'
        );

    for (let seat of seats) {
        const seatKey = `lock.${showId}.${seat}`;

        commandQueue = commandQueue
            .set(seatKey, 1)
            .expire(seatKey, CartTimeout, 'NX')
    }

    await commandQueue.exec();
}

async function removeFrom(userId, showId) {
    const cartKey = 'cart.' + userId;
    const seatsField = await redis.hGet(cartKey, `${showId}`);
    const seatIds = seatsField.split('&');
    let commandQueue = redis
        .multi()
        .hDel(
            cartKey,
            `${showId}`
        )
        .expire(
            cartKey,
            CartTimeout,
            'NX'
        );

    for (let seat of seatIds) {
        const seatKey = `lock.${showId}.${seat}`;

        commandQueue = commandQueue.del(seatKey);
    }

    const a = await commandQueue.exec();

    return;
}

async function clear(userId) {
    const cartKey = 'cart.' + userId;
    const cart = await redis.hGetAll(cartKey);
    let commandQueue = redis
        .multi()
        .del([ cartKey ]);

    for (let showId in cart) {
        const seats = cart[showId].split('&');

        for (let seat of seats) {
            const seatKey = `lock.${showId}.${seat}`;

            commandQueue = commandQueue.del(seatKey);
        }
    }

    await commandQueue.exec();
}

module.exports = { get, addTo, removeFrom, clear };
