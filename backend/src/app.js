const db = require('./db.js');
const redis = require('./redis.js');
const pkg = require('../package.json');

const hyperId = require('hyperid')({
    urlSafe: true,
    fixedLength: true
});
const fastify = require('fastify')({
    logger: true,
    genReqId: () => hyperId()
});

fastify.start = async function (port) {
    try {
        // Load and configure plugins
        {
            await fastify.register(require('@fastify/sensible'));

            await fastify.register(require('@fastify/etag'));

            await fastify.register(require('@fastify/jwt'), {
                secret: process.env.TOKEN_SECRET,
            });

            await fastify.register(require('@fastify/cors'), {
                origin: process.env.CORS_ORIGIN?.split?.(',') || process.env.FRONTEND_URL,
            });

            await fastify.register(require('@fastify/rate-limit'), {
                max: 150,
                timeWindow: '1 minute',
                allowList: ['127.0.0.1'],
            });

            await fastify.register(require('@fastify/swagger'), {
                openapi: {
                    info: {
                        title: 'Popcorn API',
                        description: 'Popcorn is a hosted theatre-management application that can be customizable to fit the brand of your establishment.\nThis document describes the API endpoints that can be used to interact with the main backend service.\n\nPlease note: This API is rate-limited to 150 requests per minute unless stated otherwise. Relevant information regarding this limitation is provided in the headers `X-Ratelimit-Limit`, `X-Ratelimit-Remaining` and `X-Ratelimit-Reset`. In case you exceed this limit please respect the value provided in the `Retry-After` header.',
                        version: pkg.version,
                    },
                    externalDocs: {
                        url: 'https://popcorn.toast.ws',
                        description: 'Live Demo'
                    },
                    servers: [
                        {
                            url: 'http://localhost:9090',
                            description: 'Local Development',
                        },
                        {
                            url: 'https://popcorn-api.toast.ws',
                            description: 'Demo Deployment',
                        },
                    ],
                    tags: [
                        { name: 'auth', description: 'Authentication endpoints' },
                        { name: 'users', description: 'User-data endpoints' },
                        { name: 'movies', description: 'Movie-related endpoints' },
                        { name: 'shows', description: 'Showings endpoints' },
                        { name: 'store', description: 'Online-shop endpoints' },
                        { name: 'theaters', description: 'Theater management endpoints' },
                        { name: 'manage', description: 'Administrative endpoints' },
                    ],
                    components: {
                        securitySchemes: {
                            bearer: {
                                type: 'http',
                                scheme: 'bearer',
                                bearerFormat: 'JWT',
                            },
                        },
                    },
                },
                hideUntagged: true,
            });

            fastify.addSchema({
                $id: 'user',
                type: 'object',
                required: ['id', 'role', 'email', 'nameFirst', 'nameLast'],
                properties: {
                    id: { type: 'string' },
                    role: { type: 'string', example: 'user' },
                    email: { type: 'string', format: 'email' },
                    nameFirst: { type: 'string' },
                    nameLast: { type: 'string' },
                    birthday: { type: 'string', format: 'date' },
                    addressLine1: { type: 'string' },
                    addressLine2: { type: 'string' },
                    addressPostcode: { type: 'string' },
                    addressTown: { type: 'string' },
                    addressState: { type: 'string' },
                    addressCountry: { type: 'string' },
                },
            });

            fastify.addSchema({
                $id: 'theater',
                type: 'object',
                required: ['id', 'name', 'features'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    features: { type: 'array', items: { type: 'string' } },
                },
            });

            fastify.addSchema({
                $id: 'seatSimple',
                type: 'object',
                required: ['id', 'displayNum', 'displayX', 'displayY', 'flagDeluxe', 'flagWheelchair'],
                properties: {
                    id: { type: 'string' },
                    displayNum: { type: 'string' },
                    displayX: { type: 'integer' },
                    displayY: { type: 'integer' },
                    flagDeluxe: { type: 'boolean' },
                    flagWheelchair: { type: 'boolean' },
                },
            });

            fastify.addSchema({
                $id: 'seatShow',
                type: 'object',
                required: ['id', 'displayNum', 'displayX', 'displayY', 'flagDeluxe', 'flagWheelchair', 'isFree'],
                properties: {
                    id: { type: 'string' },
                    displayNum: { type: 'string' },
                    displayX: { type: 'integer' },
                    displayY: { type: 'integer' },
                    flagDeluxe: { type: 'boolean', example: false },
                    flagWheelchair: { type: 'boolean', example: false },
                    isFree: { type: 'boolean' },
                },
            });

            fastify.addSchema({
                $id: 'movieSimple',
                type: 'object',
                required: ['id', 'name', 'minimumAge', 'releasedAt'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string', minLength: 1 },
                    minimumAge: { type: 'number', minimum: 0 },
                    releasedAt: { type: 'string', format: 'date' },
                    posterUrl: { type: 'string' },
                },
            });

            fastify.addSchema({
                $id: 'movieFull',
                type: 'object',
                required: ['id', 'name', 'description', 'duration', 'releasedAt'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string', minLength: 1 },
                    description: { type: 'string', minLength: 1 },
                    duration: { type: 'number', minimum: 1 },
                    minimumAge: { type: 'number', minimum: 0 },
                    releasedAt: { type: 'string', format: 'date' },
                    posterUrl: { type: 'string' },
                    imdbUrl: { type: 'string' },
                },
            });

            fastify.addSchema({
                $id: 'showSimple',
                type: 'object',
                required: ['id', 'variant', 'startsAt', 'movieId', 'theaterId'],
                properties: {
                    id: { type: 'string' },
                    variant: { type: 'array', items: { type: 'string' } },
                    startsAt: { type: 'string', format: 'date-time' },
                    movieId: { type: 'string' },
                    theaterId: { type: 'string' },
                    freeSeats: { type: 'number', minimum: 0 },
                },
            });

            fastify.addSchema({
                $id: 'showFull',
                type: 'object',
                required: ['id', 'variant', 'startsAt', 'movieId', 'theaterId'],
                properties: {
                    id: { type: 'string' },
                    variant: { type: 'array', items: { type: 'string' } },
                    startsAt: { type: 'string', format: 'date-time' },
                    movieId: { type: 'string' },
                    theaterId: { type: 'string' },
                    seats: { type: 'array', items: { $ref: 'seatShow' } },
                },
            });

            fastify.addSchema({
                $id: 'ticket',
                type: 'object',
                required: ['showId', 'seatId'],
                properties: {
                    showId: { type: 'string', minLength: 1 },
                    seatId: { type: 'string', minLength: 1 },
                    movieId: { type: 'string', minLength: 1 },
                    movieName: { type: 'string', minLength: 1 },
                },
            });

            fastify.addSchema({
                $id: 'orderSimple',
                type: 'object',
                required: ['id', 'complete', 'submittedAt'],
                properties: {
                    id: { type: 'string' },
                    complete: { type: 'boolean', example: false },
                    submittedAt: { type: 'string', format: 'date-time' },
                    completedAt: { type: 'string', format: 'date-time' },
                },
            });

            fastify.addSchema({
                $id: 'orderFull',
                type: 'object',
                required: ['id', 'userId', 'complete', 'submittedAt', 'tickets'],
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    complete: { type: 'boolean', example: false },
                    submittedAt: { type: 'string', format: 'date-time' },
                    completedAt: { type: 'string', format: 'date-time' },
                    tickets: { type: 'array', items: { $ref: 'ticket' } },
                },
            });

            fastify.addSchema({
                $id: 'rating',
                type: 'object',
                required: ['id', 'userId', 'stars', 'content'],
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    movieId: { type: 'string' },
                    movieName: { type: 'string' },
                    stars: { type: 'integer', minimum: 1, maximum: 5 },
                    content: { type: 'string' },
                },
            });

            fastify.addSchema({
                $id: 'cartItem',
                type: 'object',
                required: ['showId', 'seats'],
                properties: {
                    showId: { type: 'string' },
                    seats: { type: 'array', items: { type: 'string' } },
                },
            });

            fastify.addSchema({
                $id: 'error',
                type: 'object',
                properties: {
                    statusCode: { type: 'number' },
                    error: { type: 'string' },
                    message: { type: 'string' },
                },
            });

            await fastify.register(require('@fastify/swagger-ui'), {
                routePrefix: '/swagger',
                uiConfig: {
                    docExpansion: 'list',
                    defaultModelsExpandDepth: 3,
                    defaultModelExpandDepth: 3,
                }
            });
        }

        // Add authenticate hook
        require('./authenticate.js')(fastify);

        // Add sendMail utility
        await (require('./mailer.js')(fastify));

        // Add the routes as well
        await fastify.register(require('./routes.js'));

        // Connect database and redis
        await db.verifyConnection();
        await redis.configure(fastify);

        // Let it rip!
        await fastify.listen({ host: '0.0.0.0', port });
    } catch (e) {
        fastify.log.error(e);
        process.exit(1);
    }
}

module.exports = fastify;
