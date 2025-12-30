const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createTestAgent = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected');

        // Define User schema inline
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            phone: String,
            password: String,
            role: { type: String, default: 'agent' },
            isActive: { type: Boolean, default: true },
            kycStatus: String,
            agencyName: String,
            agencyType: String,
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

        userSchema.methods.matchPassword = async function (enteredPassword) {
            return await bcrypt.compare(enteredPassword, this.password);
        };

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const email = 'agent@tripvenza.com';
        const password = 'password123';

        // Check if agent exists
        const existing = await User.findOne({ email });

        if (existing) {
            console.log('⚠ Test agent already exists');
            console.log('Updating password...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            existing.password = hashedPassword;
            existing.role = 'agent';
            existing.isActive = true;
            existing.agencyName = 'Global Travels';
            existing.walletBalance = 100000; // Force update wallet
            await existing.save();

            console.log('✓ Test agent credentials updated');
        } else {
            console.log('Creating new test agent...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name: 'Test Agent',
                email,
                phone: '9876543210',
                password: hashedPassword,
                role: 'agent',
                isActive: true,
                kycStatus: 'Approved',
                agencyName: 'Global Travels',
                agencyType: 'Travel Agency',
                tier: 'Silver',
                walletBalance: 5000,
                address: {
                    street: '123 Main St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001',
                    country: 'India'
                },
                panNumber: 'ABCDE1234F'
            });

            console.log('✓ Test agent created');
        }

        console.log('\n=================================');
        console.log('Test Agent Credentials:');
        console.log('Email: agent@tripvenza.com');
        console.log('Password: password123');
        console.log('Agency: Global Travels');
        console.log('Expected URL: /global-travels/dashboard');
        console.log('=================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createTestAgent();
