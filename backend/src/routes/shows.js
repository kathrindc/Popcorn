const Show = require('../models/show.js');
const Seat = require('../models/seat.js');

module.exports = (fastify, _, done) => {
    const ShowNotFoundMessage = 'Show does not or no longer exists.';

    fastify.get('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Get a page of shows',
                description: 'The client can use this endpoint to retrieve a page of shows. The response is paginated. This endpoint is only meant to be used within the administrative area of the frontend, therefore it is restricted to clients with the roles "admin" or "manager".',
                tags: ['shows', 'manage'],
                security: [{ bearer: [] }],
                query: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', minimum: 1 },
                        size: { type: 'number', minimum: 10, maximum: 50 },
                        sortProp: { type: 'string', enum: ['startsAt'] },
                        sortDir: { type: 'string', enum: ['desc', 'asc'] },
                    },
                },
                response: {
                    200: {
                        description: 'The client has successfully queried a page of shows.',
                        type: 'object',
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'showSimple' } },
                        },
                    },
                    400: {
                        description: 'The client has sent a malformed request.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            return await Show.getPage(
                request.query.page || 1,
                request.query.size || 25,
                request.query.sortProp,
                request.query.sortDir
            );
        }
    );

    fastify.get('/:showId',
        {
            schema: {
                summary: 'Get details for a show',
                description: 'The client may use this endpoint to query the full details of a given show.',
                tags: ['shows'],
                params: {
                    type: 'object',
                    required: ['showId'],
                    properties: {
                        showId: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        description: 'The client successfully queried the details of a show.',
                        $ref: 'showFull',
                    },
                    404: {
                        description: 'The client has attempted to request a movie or show that does not or no longer exists.',
                        $ref: 'error',
                    },
                }
            }
        },
        async (request, _reply) => {
            const show = await Show.getById(request.params.showId);

            if (!show) {
                throw fastify.httpErrors.notFound(ShowNotFoundMessage);
            }

            show.seats = await Seat.getByShow(show.id, show.theaterId);

            return show;
        }
    );

    fastify.post('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Add a new show',
                description: 'The client may use this endpoint to create a new show for a given movie. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['shows', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['variant', 'startsAt', 'movieId', 'theaterId'],
                    properties: {
                        variant: { type: 'array', items: { type: 'string' } },
                        startsAt: { type: 'string', format: 'date-time', minLength: 10 },
                        movieId: { type: 'string', minLength: 1 },
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    201: {
                        description: 'The client successfully added a show.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the newly created show resource is accessible.',
                                type: 'string',
                                format: 'uri',
                            },
                        },
                    },
                    400: {
                        description: 'The client sent a malformed request or submitted a request with missing or invalid properties.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not have sufficient privileges to access this endpoint.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            const show = await Show.add(
                request.body.movieId,
                request.body.theaterId,
                request.body.variant,
                request.body.startsAt
            );

            reply
                .code(201)
                .header('Location', '/shows/' + show.id);
        }
    );

    fastify.put('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Update an existing show',
                description: 'The client may use this endpoint to update an existing show. Access to this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['shows', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['id', 'variant', 'startsAt', 'movieId', 'theaterId'],
                    properties: {
                        id: { type: 'string', minLength: 1 },
                        variant: { type: 'array', items: { type: 'string' } },
                        startsAt: { type: 'string', format: 'date-time', minLength: 1 },
                        movieId: { type: 'string', minLength: 1 },
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client has successfully updated a show.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client sent a malformed request or submitted a request with missing or invalid properties.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not have sufficient privileges to access this endpoint.',
                        $ref: 'error',
                    },
                }
            },
        },
        async (request, _reply) => {
            const show = await Show.update(request.body);

            if (!show) {
                throw fastify.httpErrors.notFound(ShowNotFoundMessage);
            }
        }
    );

    fastify.delete('/:showId',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager')
            ],
            schema: {
                summary: 'Delete a show',
                description: 'The client can use this route to delete a show. Usage of this endpoint is restricted to clients that are part of the roles "admin" or "manager".',
                tags: ['shows', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['showId'],
                    properties: {
                        showId: { type: 'string' },
                    },
                },
                response: {
                    204: {
                        description: 'The client has successfully deleted a show.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated to access this restricted endpoint.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client has attempted to delete a show that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Show.remove(request.params.showId))) {
                throw fastify.httpErrors.notFound(ShowNotFoundMessage);
            }

            reply.status(204);
        }
    );

    done();
};