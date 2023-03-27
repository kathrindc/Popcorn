const Theater = require('../models/theater.js');
const Seat = require('../models/seat.js');

module.exports = (fastify, _, done) => {
    const TheaterNotFound = 'Theater does not or no longer exists.';
    const SeatNotFound = 'Seat does not or no longer exists.';

    fastify.get('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Get a page of theaters',
                description: 'The client may use this route to retrieve a list of all theaters. This route is limited to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
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
                        description: 'The client successfully retrieved a page of theaters.',
                        type: 'object',
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'theater' } },
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
            }
        },
        async (request, _reply) => {
            const page = request.query.page || 1;
            const size = request.query.size || 25;

            return await Theater.getPage(page, size);
        }
    );

    fastify.get('/:theaterId',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Get details for a theater',
                description: 'The client can use this route to retrieve details about a specific theater.',
                tags: ['theaters', 'manage'],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client succesfully queried the details of a theater.',
                        $ref: 'theater',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to get details about a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const theater = await Theater.getById(request.params.theaterId);

            if (!theater) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            return theater;
        }
    );

    fastify.post('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Add a new theater',
                description: 'The client may use this endpoint to add a new theater to their establishment. This route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['name', 'features'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        features: { type: 'array', items: { type: 'string' } },
                    },
                },
                response: {
                    201: {
                        description: 'The client successfully created a new theater.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the newly created theater resource is accessible.',
                                type: 'string',
                                format: 'uri',
                            },
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
        async (request, reply) => {
            const theater = await Theater.add(request.body.name, request.body.features);

            reply
                .code(201)
                .header('Location', '/theaters/' + theater.id);
        }
    );

    fastify.put('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Update an existing theater',
                description: 'The client may use this endpoint to update an existing theater. This route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    $ref: 'theater',
                },
                response: {
                    200: {
                        description: 'The client successfully updated a theater.',
                        type: 'null',
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
                    404: {
                        description: 'The client attempted to update a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const theater = await Theater.update(request.body);

            if (!theater) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }
        }
    );

    fastify.delete('/:theaterId',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Delete a theater',
                description: 'The client may use this endpoint to delete a theater. This endpoint is restricted to clients with the roles "admin" or "manager". Deleting a theater will implicitly delete any associated shows and other resources.',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    204: {
                        description: 'The client successfully deleted a theater.',
                        type: 'null',
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
                    404: {
                        description: 'The client attempted to delete a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Theater.remove(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            reply.code(204);
        }
    );

    fastify.get('/:theaterId/seats',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Get the seats of a theater',
                description: 'The client may use this route to retrieve a list of seats in a given theater. The endpoint is restricted to clients with the role "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client succesfully queried a list of seats in the theater.',
                        type: 'array',
                        items: { $ref: 'seatSimple' },
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to list seats in a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            if (! (await Theater.exists(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            return await Seat.getByTheater(request.params.theaterId);
        }
    );

    fastify.post('/:theaterId/seats',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Add a seat to a theater',
                description: 'The client may use this endpoint to add a seat to a theater. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                body: {
                    type: 'object',
                    required: ['displayNum', 'displayX', 'displayY', 'flagDeluxe', 'flagWheelchair'],
                    properties: {
                        displayNum: { type: 'string', minLength: 1 },
                        displayX: { type: 'integer', minimum: 0 },
                        displayY: { type: 'integer', minimum: 0 },
                        flagDeluxe: { type: 'boolean' },
                        flagWheelchair: { type: 'boolean' },
                    },
                },
                response: {
                    201: {
                        description: 'The client succesfully added a seat to the theater.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the newly created seat resource is accessible.',
                                type: 'string',
                                format: 'uri',
                            },
                        },
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to add a seat to a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Theater.exists(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            const seat = await Seat.add(
                request.body.displayNum,
                request.body.displayX,
                request.body.displayY,
                request.body.flagDeluxe,
                request.body.flagWheelchair,
                request.params.theaterId
            );

            reply
                .code(201)
                .header('Location', '/theaters/' + request.params.theaterId + '/seats/' + seat.id);
        }
    );

    fastify.post('/:theaterId/seats/batch',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Add a batch of seats to a theater',
                description: 'The client may use this endpoint to add multiple seats to a theater. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                body: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['displayNum', 'displayX', 'displayY', 'flagDeluxe', 'flagWheelchair'],
                        properties: {
                            displayNum: { type: 'string', minLength: 1 },
                            displayX: { type: 'integer', minimum: 0 },
                            displayY: { type: 'integer', minimum: 0 },
                            flagDeluxe: { type: 'boolean' },
                            flagWheelchair: { type: 'boolean' },
                        },
                    }
                },
                response: {
                    201: {
                        description: 'The client succesfully added a batch of seats to the theater.',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' }
                            }
                        }
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to add a seat to a theater that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Theater.exists(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            const seats = await Seat.batchAdd(
                request.body,
                request.params.theaterId
            );

            reply.code(201);

            return seats.map(seat => ({ id: seat.id }));
        }
    );

    fastify.put('/:theaterId/seats',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Update a seat in a theater',
                description: 'The client may use this endpoint to update a single seat in a theater. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                    },
                },
                body: {
                    $ref: 'seatSimple',
                },
                response: {
                    200: {
                        description: 'The client succesfully updated a seat in the theater.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The requested theater and or seat does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            if (! (await Theater.exists(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            if (! (await Seat.update(request.params.theaterId, request.body))) {
                throw fastify.httpErrors.notFound(SeatNotFound);
            }
        }
    );

    fastify.delete('/:theaterId/seats/:seatId',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager'),
            ],
            schema: {
                summary: 'Delete a seat from a theater',
                description: 'The client may use this endpoint to remove a seat from a theater. Usage of this route is restricted to clients with the roles "admin" or "manager".',
                tags: ['theaters', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['theaterId', 'seatId'],
                    properties: {
                        theaterId: { type: 'string', minLength: 1 },
                        seatId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    204: {
                        description: 'The client succesfully deleted a seat in the theater.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    403: {
                        description: 'The client does not posses sufficient privileges to use this endpoint.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The requested theater and or seat does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Theater.exists(request.params.theaterId))) {
                throw fastify.httpErrors.notFound(TheaterNotFound);
            }

            if (! (await Seat.remove(request.params.theaterId, request.params.seatId))) {
                throw fastify.httpErrors.notFound(SeatNotFound);
            }

            reply.code(204);
        }
    );

    done();
};
