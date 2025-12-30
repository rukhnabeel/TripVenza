const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected');

        // Define User schema inline to avoid model compilation issues
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            phone: String,
            password: String,
            role: { type: String, default: 'agent' },
            isActive: { type: Boolean, default: true },
            kycStatus: String,
            address: {
                street: String,
                city: String,
                state: String,
                zip: String,
                country: String
            },
            panNumber: String,
            walletBalance: { type: Number, default: 0 },
            tier: String
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const email = process.env.ADMIN_EMAIL || 'admin@tripvenza.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin exists
        const existing = await User.findOne({ email });

        if (existing) {
            console.log('⚠ Admin user already exists');
            console.log('Updating password and role...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            existing.password = hashedPassword;
            existing.role = 'admin';
            existing.isActive = true;
            await existing.save();

            console.log('✓ Admin credentials updated');
        } else {
            console.log('Creating new admin user...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name: 'Super Admin',
                email,
                phone: '9999999999',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                kycStatus: 'Approved',
                tier: 'Platinum',
                walletBalance: 0,
                address: {
                    street: 'Admin HQ',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zip: '110001',
                    country: 'India'
                },
                panNumber: 'ADMIN0000X'
            });

            console.log('✓ Admin user created');
        }

        console.log('\n=================================');
        console.log('Admin Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('=================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
