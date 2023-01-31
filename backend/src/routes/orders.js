const Order = require('../models/order.js');

module.exports = (fastify, _, done) => {
    fastify.get('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Get a page of orders',
                description: 'The client may use this endpoint to retrieve a subset of orders. The data offered by this route is paginated. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['store', 'manage'],
                security: [{ bearer: [] }],
                query: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', minimum: 1 },
                        size: { type: 'number', minimum: 10, maximum: 50 },
                    },
                },
                response: {
                    200: {
                        description: 'The client successfully retrieved a page of orders.',
                        type: 'object',
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'orderFull' } },
                        },
                    },
                    400: {
                        description: 'The client sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const page = request.query.page || 1;
            const size = request.query.size || 25;

            return await Order.getPage(page, size);
        }
    );

    done();
};
