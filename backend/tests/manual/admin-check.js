const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@tripvenza.com';
        const password = 'admin123';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('Admin user NOT found. Creating...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const admin = new User({
                name: 'Super Admin',
                email: email,
                phone: '0000000000',
                password: hashedPassword,
                role: 'admin',
                isActive: true, // Ensure active
                kycStatus: 'Approved',
                address: {
                    street: 'Admin St',
                    city: 'Admin City',
                    state: 'Admin State',
                    zip: '000000',
                    country: 'India'
                },
                panNumber: 'ADMINPAN123'
            });

            await admin.save();
            console.log('Admin user created successfully.');
        } else {
            console.log(`Admin user found: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`IsActive: ${user.isActive}`);

            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password 'admin123' match: ${isMatch}`);

            if (!isMatch) {
                console.log('Password mismatch. Resetting to "admin123"...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                user.password = hashedPassword;
                user.role = 'admin'; // Enforce role
                user.isActive = true; // Enforce active
                await user.save();
                console.log('Password reset successfully.');
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
