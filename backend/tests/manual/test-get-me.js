const mongoose = require('mongoose');
const User = require('../../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const testGetMe = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('ERROR: MONGO_URI is missing');
            process.exit(1);
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);

        // Find a test user (e.g. admin or any agent)
        const user = await User.findOne();

        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        console.log('Testing retrieval for user:', user.email);

        // Simulate getMe logic
        const fetchedUser = await User.findById(user._id).select('-password');

        console.log('Fetched User Balance:', fetchedUser.walletBalance);

        if (fetchedUser.walletBalance !== undefined) {
            console.log('SUCCESS: walletBalance is present');
        } else {
            console.log('FAILURE: walletBalance is missing');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Script Error:', error);
    }
};

testGetMe();
