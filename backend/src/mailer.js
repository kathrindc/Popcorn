const nodemailer = require('nodemailer');

module.exports = async (fastify) => {
    const useMailcatcher = !!process.env.USE_MAILCATCHER;
    const smtpSenderName = process.env.SMTP_SENDER_NAME || 'Popcorn';
    let smtpHost = process.env.SMTP_HOST;
    let smtpPort = +(process.env.SMTP_PORT);
    let smtpUser = process.env.SMTP_USER;
    let smtpPassword = process.env.SMTP_PASSWORD;

    if (useMailcatcher) {
        const testAccount = await nodemailer.createTestAccount();

        smtpHost = testAccount.smtp.host;
        smtpPort = testAccount.smtp.port;
        smtpUser = testAccount.user;
        smtpPassword = testAccount.pass;
    } else {
        for (let name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM', 'SMTP_USER', 'SMTP_PASSWORD']) {
            if (! process.env[name] || process.env[name].trim().length < 1) {
                fastify.log.error(`missing ${name} environment variable`);
                process.exit(1);
            }
        }
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: (smtpPort == 465),
        auth: {
            user: smtpUser,
            pass: smtpPassword,
        },
    });

    await transporter.verify();

    fastify.log.info(`sending mails via ${smtpHost}:${smtpPort} as ${smtpUser}`);
    fastify.decorate('sendMail', async (options) => {
        const mergedOptions = { ...options, from: `${smtpSenderName} <${smtpUser}>` };
        const messageInfo = await transporter.sendMail(mergedOptions)

        if (useMailcatcher) {
            const url = nodemailer.getTestMessageUrl(messageInfo);

            fastify.log.info(`view caught email at ${url}`);
        }

        return messageInfo;
    });
};
