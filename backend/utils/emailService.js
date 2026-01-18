const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html, attachments = []) => {
    // Check if SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"TripVenza Support" <support@tripvenza.com>',
                to: to,
                subject: subject,
                html: html,
                attachments: attachments
            });

            console.log(`\n📧 [EMAIL SENT] Message ID: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('Email sending failed (SMTP):', error);
            // Fallback to mock if SMTP fails? Or just return false.
            // For now, let's return false so the caller knows it failed.
            return false;
        }
    } else {
        // Mock Implementation for Development
        try {
            console.log(`\n📧 [EMAIL MOCK] (Set SMTP_HOST in .env to send real emails)`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('--- Body ---');
            // console.log(html); // Uncomment to see full HTML
            console.log('[Email Content Hidden]');
            console.log('--- End Email ---\n');
            return true;
        } catch (error) {
            console.error('Email mock failed:', error);
            return false;
        }
    }
};

module.exports = { sendEmail };
