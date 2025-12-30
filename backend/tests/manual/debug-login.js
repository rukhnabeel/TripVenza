const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const debugLogin = async () => {
    await connectDB();

    const email = 'agent@tripvenza.com';
    const password = 'password123';

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User not found: ${email}`);
            return;
        }

        console.log(`User found: ${user.email}`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for '${password}': ${isMatch}`);

        if (!isMatch) {
            console.log('--- Attempting to reset password ---');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword; // Mongoose pre-save might re-hash if we are not careful, but usually it checks isModified

            // Bypass pre-save hook by using updateOne if needed, but let's try standard save first
            // Actually, let's use the exact logic from the model to be sure
            // The model has a pre-save hook.

            user.password = password; // Set plain text, let pre-save hash it
            await user.save();
            console.log('Password reset to:', password);

            // Verify again
            const upgradedUser = await User.findOne({ email });
            const reMatch = await bcrypt.compare(password, upgradedUser.password);
            console.log(`Re-verification match: ${reMatch}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

debugLogin();
