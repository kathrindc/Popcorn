const User = require('../models/user.js');

module.exports = (fastify, _, done) => {
    const InvalidCredentialsMessage = 'Invalid email address and or password combination.';
    const AccountNotConfirmedMessage = 'This account has not been confirmed yet. Please check your emails.'
    const AccountAlreadyConfirmedMessage = 'This account has already been activated.';
    const ConfirmationNotFoundMessage = 'The requested confirmation token could not be found.';
    const frontendUrl = process.env.FRONTEND_URL;

    if (! frontendUrl || frontendUrl.trim().length < 1) {
        fastify.log.error('missing FRONTEND_URL environment variable');
        process.exit(1);
    }

    fastify.post('/login',
        {
            schema: {
                summary: 'Log in using email and password',
                description: 'The client can use this endpoint to authenticate using a email and password credentials to receive a JSON Web Token, which can be used to access protected routes.',
                tags: ['auth'],
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', minLength: 1 },
                        password: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client has successfully authenticated using valid credentials.',
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                    400: {
                        description: 'The client did not provide all neccessary properties in the submitted request body or sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client did not provide a set of valid credentials or the account has not been activated yet.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;
            const user = await User.getByCredentials(email, password);

            if (!user) {
                throw fastify.httpErrors.unauthorized(InvalidCredentialsMessage);
            }

            const confirmation = await User.getConfirmationData(user.id);

            if (!confirmation.confirmed) {
                throw fastify.httpErrors.unauthorized(AccountNotConfirmedMessage);
            }

            return {
                token: await reply.jwtSign({
                    id: user.id,
                    role: user.role,
                })
            };
        }
    );

    fastify.post('/register',
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: '1 hour'
                },
            },
            schema: {
                summary: 'Register a new account',
                description: 'The client can use this endpoint to register a new account. This newly created account will not be accessible until the email confirmation has been completed. To avoid abuse, this route is more heavily rate-limited to 5 requests per hour.',
                tags: ['auth'],
                body: {
                    type: 'object',
                    required: ['email', 'password', 'nameFirst', 'nameLast', 'birthday', 'addressLine1', 'addressLine2', 'addressPostcode', 'addressTown', 'addressState', 'addressCountry'],
                    properties: {
                        email: { type: 'string', format: 'email', minLength: 1 },
                        password: { type: 'string', minLength: 1 },
                        nameFirst: { type: 'string', minLength: 1 },
                        nameLast: { type: 'string', minLength: 1 },
                        birthday: { type: 'string', format: 'date', minLength: 1 },
                        addressLine1: { type: 'string', minLength: 1 },
                        addressLine2: { type: 'string' },
                        addressPostcode: { type: 'string', minLength: 1 },
                        addressTown: { type: 'string', minLength: 1 },
                        addressState: { type: 'string', minLength: 1 },
                        addressCountry: { type: 'string', minLength: 2, maxLength: 2 },
                    },
                },
                response: {
                    201: {
                        description: 'The client has successfully registered a new account.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client did not provide all neccessary properties in the submitted request body or sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client did not provide a set of valid credentials.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            const { email, password, nameFirst, nameLast, birthday, addressLine1, addressLine2, addressPostcode, addressTown, addressState, addressCountry } = request.body;
            const user = await User.add('user', email, password, nameFirst, nameLast, birthday, addressLine1, addressLine2, addressPostcode, addressTown, addressState, addressCountry);
            const confirmUrl = `${frontendUrl}/confirm?id=${user.id}&key=${user.key}`;

            await fastify.sendMail({
                to: `${nameFirst} ${nameLast} <${email}>`,
                subject: 'Confirm your account - User registration',
                text: `Hello ${nameFirst}\nPlease activate your newly created account with the link below.\n${confirmUrl}`,
                html: `<b>Hello ${nameFirst}</b><br/>Please activate your newly created account by clicking <a href="${confirmUrl}">here</a>.`,
            });

            reply.code(201);
        }
    );

    fastify.post('/reset',
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: '1 hour'
                },
            },
            schema: {
                summary: 'Initiate a password reset',
                description: 'The client can use this endpoint to initiate the process of resetting an account\'s password. To avoid abuse, this route is more heavily rate-limited to 5 requests per hour.',
                tags: ['auth'],
                body: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'In case an account with the provided email address exists, a mail will be sent by the server.',
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                    400: {
                        description: 'The client did not provide all neccessary properties in the submitted request body or sent a malformed request.',
                        $ref: 'error',
                    },
                    401: {
                        description: 'The client did not provide a set of valid credentials.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, reply) => {
            throw fastify.httpErrors.notImplemented();
        }
    );

    fastify.post('/confirm',
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: '1 hour'
                },
            },
            schema: {
                summary: 'Complete an email confirmation',
                description: 'This endpoint is used to complete the email confirmation process. To avoid abuse, this route is more heavily rate-limited to 5 requests per hour.',
                tags: ['auth'],
                body: {
                    type: 'object',
                    required: ['id', 'key'],
                    properties: {
                        id: { type: 'string', minLength: 1 },
                        key: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        description: 'The client successfully confirmed their account.',
                        type: 'null',
                    },
                    400: {
                        description: 'The client sent a malformed request or the account has already been confirmed.',
                        $ref: 'error',
                    },
                },
            },
        },
        async (request, _reply) => {
            const confirmation = await User.getConfirmationData(request.body.id, true);

            if ((! confirmation) || (confirmation.key != request.body.key)) {
                throw fastify.httpErrors.badRequest(ConfirmationNotFoundMessage);
            }

            if (confirmation.confirmed) {
                throw fastify.httpErrors.badRequest(AccountAlreadyConfirmedMessage);
            }

            if (! (await User.confirm(request.body.id, request.body.key))) {
                throw fastify.httpErrors.badRequest(ConfirmationNotFoundMessage);
            }
        }
    );

    done();
};
