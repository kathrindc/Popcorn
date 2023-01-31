const Movie = require('../models/movie.js');
const Show = require('../models/show.js');
const Seat = require('../models/seat.js');

module.exports = (fastify, _, done) => {
    const MovieNotFoundMessage = 'Movie does not or no longer exists.';

    fastify.get('/',
        {
            schema: {
                summary: 'Gets a page of movies',
                description: 'The client can use this endpoint to query a page of movies. Depending on the query parameters it is possible to include movies, that do not have current shows, in the results.\nPlease note that the movies returned by this route only contain a limited subset of properties.',
                tags: ['movies'],
                query: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', minimum: 1 },
                        size: { type: 'number', minimum: 10, maximum: 50 },
                        inactive: { type: 'boolean' },
                    },
                },
                response: {
                    200: {
                        description: 'The client has successfully queried a page of movies.',
                        type: 'object',
                        required: ['totalRecords', 'totalPages', 'currentPage', 'records'],
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'movieSimple' } },
                        },
                    },
                },
            },
        },
        async (request, _reply) => {
            const page = request.query.page || 1;
            const size = request.query.size || 25;
            const includeInactive = (request.query.inactive == true) || false;
            const result = await Movie.getPage(includeInactive, page, size);

            return result;
        }
    );

    fastify.get('/:id',
        {
            schema: {
                summary: 'Get the details for a movie',
                description: 'The client can use this endpoint to retrieve the full details for a movie.',
                tags: ['movies'],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' }
                    }
                },
                response: {
                    200: {
                        description: 'The client has successfully queried the details of the movie.',
                        $ref: 'movieFull',
                    },
                    404: {
                        description: 'The client has requested details for a movie, which does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const movieId = request.params.id;
            const movie = await Movie.getById(movieId);

            if (!movie) {
                throw fastify.httpErrors.notFound(MovieNotFoundMessage);
            }

            return movie;
        }
    );

    fastify.post('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager')
            ],
            schema: {
                summary: 'Add a new movie',
                description: 'The client can use this route to add a new movie. Usage of this endpoint is restricted to clients that are part of the roles "admin" or "manager".\nPlease note that this does not allocate any shows for the movie.',
                tags: ['movies', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['name', 'description', 'duration', 'releasedAt'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        description: { type: 'string', minLength: 1 },
                        duration: { type: 'number', minimum: 1 },
                        minimumAge: { type: 'number', minimum: 0 },
                        releasedAt: { type: 'string', format: 'date' },
                        posterUrl: { type: 'string' },
                        imdbUrl: { type: 'string' },
                    },
                },
                response: {
                    201: {
                        description: 'The client has successfully created a new movie.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the newly created movie resource is accessible.',
                                type: 'string',
                                format: 'uri',
                            },
                        },
                    },
                    400: {
                        description: 'The client did not provide all required fields in the submitted request body or sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated to access this restricted endpoint.',
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
            const { name, description, duration, minimumAge, releasedAt, posterUrl, imdbUrl } = request.body;
            const movie = await Movie.add(name, description, duration, minimumAge, releasedAt, posterUrl, imdbUrl);

            reply
                .code(201)
                .header('Location', '/movies/' + movie.id);
        }
    );

    fastify.put('/',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager')
            ],
            schema: {
                summary: 'Update an existing movie',
                description: 'The client can use this route to update an existing movie. Usage of this endpoint is restricted to clients that are part of the roles "admin" or "manager".',
                tags: ['movies', 'manage'],
                security: [{ bearer: [] }],
                body: {
                    $ref: 'movieFull'
                },
                response: {
                    200: {
                        description: 'The client has successfully updated an existing movie.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client did not provide all required fields in the submitted request body or sent a malformed request.',
                        $ref: 'error',
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
                        description: 'The client attempted to update a movie that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const movie = await Movie.update(request.body);

            if (!movie) {
                throw fastify.httpErrors.notFound(MovieNotFoundMessage);
            }
        }
    );

    fastify.delete('/:id',
        {
            onRequest: [
                fastify.authenticate('admin', 'manager')
            ],
            schema: {
                summary: 'Delete a movie',
                description: 'The client can use this route to delete a movie. Usage of this endpoint is restricted to clients that are part of the roles "admin" or "manager".\nPlease note that this route will also implicitly delete any shows that are associated with the movie.',
                tags: ['movies', 'manage'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' },
                    },
                },
                response: {
                    204: {
                        description: 'The client has successfully deleted a movie.',
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
                        description: 'The client has attempted to delete a movie that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            if (! (await Movie.remove(request.params.id))) {
                throw fastify.httpErrors.notFound(MovieNotFoundMessage);
            }

            reply.code(204);
        }
    );

    fastify.get('/:movieId/shows',
        {
            schema: {
                summary: 'Get a list of movie shows by week',
                description: 'The client use this endpoint to query a list of shows for a given movie. By default, only shows during the current week are returned. To query results for a different week, the client may pass along the an arbitrary date within the desired week using the `date` query parameter.',
                tags: ['movies', 'shows'],
                query: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', format: 'date' },
                    },
                },
                params: {
                    type: 'object',
                    required: ['movieId'],
                    properties: {
                        movieId: { type: 'string' },
                    }
                },
                response: {
                    200: {
                        description: 'The client has successfully queried a list of shows.',
                        type: 'array',
                        items: { $ref: 'showSimple' },
                    },
                    404: {
                        description: 'The client has attempted to list shows for a movie that does not or no longer exists.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            if (! (await Movie.exists(request.params.movieId))) {
                throw fastify.httpErrors.notFound(MovieNotFoundMessage);
            }

            const date = request.query.date || new Date().toISOString().split('T')[0];
            const shows = await Show.getByMovie(request.params.movieId, date);

            return shows;
        }
    );


    done();
};
