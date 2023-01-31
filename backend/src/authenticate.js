module.exports = (fastify) => {
    const NotAuthenticatedMessage = 'You are not authenticated.';
    const NotAuthorizedMessage = 'You are not authorized to access this resource.';

    const verify = async (request) => {
        try {
            return await request.jwtVerify();
        } catch (_e) {
            throw fastify.httpErrors.unauthorized(NotAuthenticatedMessage);
        }
    };

    fastify.decorate('authenticate', (...roles) => {
        if (roles.length > 0) {
            return async (request, _reply) => {
                const data = await verify(request);

                if ((! data.role) || (! roles.includes(data.role))) {
                    throw fastify.httpErrors.forbidden(NotAuthorizedMessage);
                }
            };
        }

        return async (request, _reply) => { await verify(request) };
    });
}