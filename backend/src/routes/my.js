const User = require('../models/user.js');
const Seat = require('../models/seat.js');
const Show = require('../models/show.js');
const Order = require('../models/order.js');
const Rating = require('../models/rating.js');
const Movie = require('../models/movie.js');
const Cart = require('../models/cart.js');

module.exports = (fastify, _, done) => {
    const AccountNotFoundMessage = 'The account you are using does not or no longer exists.';
    const PasswordMismatchMessage = 'The old password you provided is not correct.';
    const MovieNotFoundMessage = 'This movie does not or no longer exists.';
    const RatingNotFoundMessage = 'This rating does not or no longer exists.';
    const ShowNotFoundMessage = 'This show does not or no longer exists.';
    const SeatTakenMessage = 'The seat you requested is already taken.';
    const CartEmptyMessage = 'Your cart is currently empty.';
    const OrderNotFoundMessage = 'This order does not exist.';

    fastify.get('/account',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Get the client\'s account',
                description: 'The client can use this endpoint to retrieve information about the currently authenticated account.',
                tags: ['users'],
                security: [{ bearer: [] }],
                response: {
                    200: {
                        description: 'The client successfully queried their account data.',
                        $ref: 'user',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            return await User.getByIdClean(request.user.id);
        }
    );

    fastify.put('/account',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Update the client\'s account',
                description: 'The client may use this endpoint to update their account\'s information.',
                tags: ['users'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['email', 'nameFirst', 'nameLast', 'addressLine1', 'addressLine2', 'addressPostcode', 'addressTown', 'addressState', 'addressCountry'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        nameFirst: { type: 'string', minLength: 1 },
                        nameLast: { type: 'string', minLength: 1 },
                        addressLine1: { type: 'string', minLength: 1 },
                        addressLine2: { type: 'string' },
                        addressPostcode: { type: 'string', minLength: 1 },
                        addressTown: { type: 'string', minLength: 1 },
                        addressState: { type: 'string', minLength: 1 },
                        addressCountry: { type: 'string', minLength: 2, minLength: 2 },
                    },
                },
                response: {
                    200: {
                        description: 'The client successfully updated their account details.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client has sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    }
                }
            },
        },
        async (request, _reply) => {
            const user = await User.getById(request.user.id);
            const emailChanged = (user.email != request.body.email);

            user.email = request.body.email;
            user.nameFirst = request.body.nameFirst;
            user.nameLast = request.body.nameLast;
            user.addressLine1 = request.body.addressLine1;
            user.addressLine2 = request.body.addressLine2;
            user.addressPostcode = request.body.addressPostcode;
            user.addressTown = request.body.addressTown;
            user.addressState = request.body.addressState;
            user.addressCountry = request.body.addressCountry;

            await User.update(user);

            if (emailChanged) {
                // TODO: Send confirmation to new email
            }
        }
    );

    fastify.patch('/account/password',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Update the client\'s password',
                description: 'The client may use this endpoint to change the password of their account. Both the old and the new password need to be provided.',
                tags: ['users'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { type: 'string', minLength: 8 },
                        newPassword: { type: 'string', minLength: 8 },
                    },
                },
                response: {
                    200: {
                        description: 'The user successfully changed their account\'s password.',
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
                },
            },
        },
        async (request, _reply) => {
            const result = await User.passwordSafe(request.user.id, request.body.oldPassword, request.body.newPassword);

            if (result == null) {
                throw fastify.httpErrors.notFound(AccountNotFoundMessage);
            }

            if (!result) {
                throw fastify.httpErrors.badRequest(PasswordMismatchMessage);
            }
        }
    );

    fastify.get('/orders',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Get a page of the client\'s orders',
                description: 'The client may use this endpoint to retrieve a subset of their own orders. The data that is offered by this route is paginated.',
                tags: ['users', 'store'],
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
                        description: 'The client successfully retrieved a page of their orders.',
                        type: 'object',
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'orderSimple' } },
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
                },
            },
        },
        async (request, _reply) => {
            const page = request.query.page || 1;
            const size = request.query.size || 25;

            return await Order.getPageByUser(page, size, request.user.id);
        }
    );

    fastify.get('/orders/:orderId',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Get a details on one of the client\'s orders',
                description: 'The client may use this endpoint to retrieve details about one of their own orders.',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client successfully retrieved one of their orders.',
                        $ref: 'orderFull',
                    },
                    400: {
                        description: 'The client sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to access an order that does not exist.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const order = await Order.getById(request.params.orderId);

            if (!order || order.userId != request.user.id) {
                throw fastify.httpErrors.notFound(OrderNotFoundMessage);
            }

            return order;
        }
    );

    fastify.post('/orders',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Submit an order',
                description: 'The client may use this endpoint to submit the current contents of their cart as a new order.',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                response: {
                    201: {
                        description: 'The client successfully placed their order.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the placed order is accessible.',
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
                },
            },
        },
        async (request, reply) => {
            const cart = await Cart.get(request.user.id);

            if (! cart) {
                throw fastify.httpErrors.badRequest(CartEmptyMessage);
            }

            const order = await Order.add(request.user.id, cart.items);

            reply
                .code(201)
                .header('Location', '/my/orders/' + order.id);
        }
    );

    fastify.get('/ratings',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Get a page of the client\'s ratings',
                description: 'The client may use this route to retrieve a subset of their own movie ratings. The data is offered via this route is paginated.',
                tags: ['users'],
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
                        description: 'The client successfully retrieved a page of their orders.',
                        type: 'object',
                        properties: {
                            totalRecords: { type: 'number' },
                            totalPages: { type: 'number' },
                            currentPage: { type: 'number' },
                            records: { type: 'array', items: { $ref: 'rating' } },
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
                },
            },
        },
        async (request, _reply) => {
            const page = request.query.page || 1;
            const size = request.query.size || 25;

            return await Rating.getPageByUser(page, size, request.user.id);
        }
    );

    fastify.post('/ratings',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Submit a new rating',
                description: 'The client can use this endpoint to submit a new rating for a given movie. The rating itself is done with "stars", ranging from 1 (worst) to 5 (best).',
                tags: ['users'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['movieId', 'stars', 'content'],
                    properties: {
                        movieId: { type: 'string', minLength: 1 },
                        stars: { type: 'number', minimum: 1, maximum: 5 },
                        content: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    201: {
                        description: 'The client successfully submitted a new review.',
                        type: 'null',
                        headers: {
                            'Location': {
                                description: 'The Location header is set to the URL where the newly created rating resource is accessible.',
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
                }
            },
        },
        async (request, reply) => {
            if (! (await Movie.exists(request.body.movieId))) {
                throw fastify.httpErrors.badRequest(MovieNotFoundMessage);
            }

            const rating = await Rating.add(request.body.movieId, request.user.id, request.body.stars, request.body.content);

            reply
                .code(201)
                .header('Location', '/ratings/' + rating.id);
        }
    );

    fastify.delete('/ratings/:ratingId',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Delete a rating',
                description: 'The client may use this route to delete one of their own ratings.',
                tags: ['users'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['ratingId'],
                    properties: {
                        ratingId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    204: {
                        description: 'The client successfully submitted deleted a review.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client attempted to delete a review that does not or no longer exists.',
                        $ref: 'error',
                    },
                }
            },
        },
        async (request, reply) => {
            const ownerId = await Rating.whoOwns(request.params.ratingId);

            if (!ownerId || ownerId != request.user.id) {
                throw fastify.httpErrors.notFound(RatingNotFoundMessage);
            }

            await Rating.remove(request.params.ratingId);

            reply.code(204);
        }
    );

    fastify.get('/cart',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Retrieve the client\'s cart',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                response: {
                    200: {
                        description: 'The client successfully retrieved the contents of their cart.',
                        type: 'object',
                        properties: {
                            expiry: { type: 'string', format: 'date-time' },
                            items: { type: 'array', items: { $ref: 'cartItem' } },
                        },
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                    404: {
                        description: 'The client requested their cart, but there are no items in their cart.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const cart = await Cart.get(request.user.id);

            if (! cart) {
                throw fastify.httpErrors.notFound(CartEmptyMessage);
            }

            return cart;
        }
    );

    fastify.post('/cart',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Add an item to the client\'s cart',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                body: {
                    type: 'object',
                    required: ['showId', 'seats'],
                    properties: {
                        showId: { type: 'string', minLength: 1 },
                        seats: { type: 'array', items: { type: 'string', minLength: 1 } },
                    },
                },
                response: {
                    201: {
                        description: 'The client successfully added an item to their cart.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client attempted to book an unknown show or a seat that is already taken.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            const show = await Show.getById(request.body.showId);

            if (!show) {
                throw fastify.httpErrors.badRequest(ShowNotFoundMessage);
            }

            for (let seat of request.body.seats) {
                if (! (await Seat.isFree(show.id, show.theaterId, seat))) {
                    throw fastify.httpErrors.badRequest(SeatTakenMessage);
                }
            }

            await Cart.addTo(request.user.id, request.body.showId, request.body.seats);

            reply.code(201);
        }
    );

    fastify.delete('/cart',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Clear the client\'s cart',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                response: {
                    204: {
                        description: 'The client successfully clear their cart.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            await Cart.clear(request.user.id);

            reply.code(204);
        }
    );

    fastify.delete('/cart/:showId',
        {
            onRequest: [
                fastify.authenticate(),
            ],
            schema: {
                summary: 'Remove an item from the client\'s cart',
                tags: ['users', 'store'],
                security: [{ bearer: [] }],
                params: {
                    type: 'object',
                    required: ['showId'],
                    properties: {
                        showId: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    204: {
                        description: 'The client successfully removed an item from their cart.',
                        type: 'null',
                    },
                    401: {
                        description: 'The client is not authenticated.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            await Cart.removeFrom(request.user.id, request.params.showId);

            reply.code(204);
        }
    );

    done();
};