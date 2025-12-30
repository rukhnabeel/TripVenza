const bcrypt = require('bcryptjs');
const User = require('../models/User');

const mongoose = require('mongoose');

const ensureAdmin = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('--- ensureAdmin: Waiting for DB connection... ---');
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (mongoose.connection.readyState !== 1) {
                console.log('--- ensureAdmin: DB still not connected. Aborting check. ---');
                return;
            }
        }

        const email = 'admin@tripvenza.com';
        const password = 'admin123';

        console.log('--- ensureAdmin: Checking for Admin User... ---');
        const user = await User.findOne({ email });

        if (!user) {
            console.log('--- Creating Admin User ---');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name: 'Super Admin',
                email: email,
                phone: '9999999999',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                kycStatus: 'Approved',
                address: {
                    street: 'Admin HQ',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zip: '110001',
                    country: 'India'
                },
                panNumber: 'ADMIN0000X'
            });
            console.log('--- Admin User Created: admin@tripvenza.com / admin123 ---');
        } else {
            console.log('--- Admin User Exists ---');
            // Optional: Check if password matches, if not reset?
            // Let's force reset to be sure
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch || user.role !== 'admin') {
                console.log('--- Resetting Admin Credentials ---');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user.password = hashedPassword;
                user.role = 'admin';
                user.isActive = true;
                await user.save();
                console.log('--- Admin Password/Role Reset to Default ---');
            }
        }
    } catch (error) {
        console.error('Ensure Admin Error:', error);
    }
};

module.exports = ensureAdmin;
