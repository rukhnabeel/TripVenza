const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 20000, // Timeout after 20s
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('\n⚠️  TROUBLESHOOTING:');
        console.error('   1. Check if your IP is whitelisted in MongoDB Atlas');
        console.error('   2. Verify your MongoDB credentials in .env');
        console.error('   3. Check your internet connection\n');

        // Don't exit - let the server start anyway so we can see other errors
        console.log('⚠️  Server will start but database features will not work');
    }
};

module.exports = connectDB;
