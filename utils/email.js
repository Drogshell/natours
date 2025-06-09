const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Looking to send emails in production? Check out our Email API/SMTP product!
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'Trevin R <fakeEmail@fakemial.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
