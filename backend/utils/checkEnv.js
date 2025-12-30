const checkEnv = () => {
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET'
        // 'SMTP_HOST', // Optional in dev
        // 'CLOUDINARY_CLOUD_NAME' // Optional in dev
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn('⚠️  [WARNING] Missing Environment Variables:');
        missing.forEach(key => console.warn(`   - ${key}`));
        console.warn('   Some features may not work correctly.\n');
    } else {
        console.log('✅ [ENV] All required environment variables are present.');
    }
};

module.exports = checkEnv;
