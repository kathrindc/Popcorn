module.exports = (fastify, _, done) => {
    fastify.register(require('./routes/auth.js'), { prefix: '/auth' });
    fastify.register(require('./routes/movies.js'), { prefix: '/movies' });
    fastify.register(require('./routes/shows.js'), { prefix: '/shows' });
    fastify.register(require('./routes/my.js'), { prefix: '/my' });
    fastify.register(require('./routes/webhook.js'), { prefix: '/webhook'});
    fastify.register(require('./routes/theaters.js'), { prefix: '/theaters' });
    fastify.register(require('./routes/orders.js'), { prefix: '/orders' });

    done();
};
