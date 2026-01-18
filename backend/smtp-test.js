require('dotenv').config();
const nodemailer = require('nodemailer');

// Hardcode your Hostinger details here for testing
const config = {
    host: 'smtp.hostinger.com', // Try smtp.titan.email if this fails
    port: 465,
    secure: true,
    auth: {
        user: 'noreply@tripvenzaholidays.com',
        pass: '@tripV786'
    }
};

async function testSMTP() {
    console.log('Testing SMTP Connection to:', config.host);
    console.log('User:', config.auth.user);

    const transporter = nodemailer.createTransport(config);

    try {
        await transporter.verify();
        console.log('✅ Success! SMTP credentials are correct.');

        // Try sending a test email
        const info = await transporter.sendMail({
            from: `"TripVenza Test" <${config.auth.user}>`,
            to: config.auth.user, // Send to yourself
            subject: "SMTP Test",
            text: "If you see this, sending works!"
        });
        console.log('✅ Email sent:', info.messageId);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ETIMEDOUT') console.log('-> Connection Timed Out. Host blocked or wrong port.');
        if (error.code === 'EAUTH') console.log('-> Authentication Failed. Wrong password or 2FA enabled.');
    }
}

testSMTP();
