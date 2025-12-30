const mongoose = require('mongoose');
const User = require('../../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios'); // Optional if testing via API, but here we test Controller Logic directly or sim

// We will verify logic by direct DB manipulation and "simulation" of login check
// creating a real HTTP request script is better if server is running, but let's stick to logic test first
// Actually, let's use the Controllers directly if possible, or just DB state.

// Let's rely on DB state for block/unblock and Manual Login Check logic.

const testBlockUnblock = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('ERROR: MONGO_URI is missing');
            process.exit(1);
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);

        // 1. Setup Test Agent
        const email = 'block_test_agent@tripvenza.com';
        await User.deleteOne({ email });

        // Custom Create to ensure password hashing
        // We can't use User.create directly for password if we want to test matchPassword unless we hash it manually here
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        const user = await User.create({
            name: 'Block Test Agent',
            email,
            phone: '8888888888',
            password: hash,
            role: 'agent',
            panNumber: 'BPAN12345',
            address: { street: 'Test', city: 'Test', state: 'Test', zip: '000000', country: 'India' },
            isActive: true
        });

        console.log(`Agent Created: ${user._id} (Active: ${user.isActive})`);

        // 2. Test Login (Simulate)
        const loginCheck1 = await User.findOne({ email });
        if (loginCheck1 && (await loginCheck1.matchPassword('password123'))) {
            if (!loginCheck1.isActive) console.log('Login 1 FAILED (Unexpected)');
            else console.log('Login 1 SUCCESS (Expected)');
        }

        // 3. Block User
        loginCheck1.isActive = false;
        await loginCheck1.save();
        console.log('Agent Blocked.');

        // 4. Test Login (Simulate)
        const loginCheck2 = await User.findOne({ email });
        if (loginCheck2 && (await loginCheck2.matchPassword('password123'))) {
            if (!loginCheck2.isActive) console.log('Login 2 BLOCKED (Expected)');
            else console.log('Login 2 SUCCESS (Unexpected - Should be blocked)');
        }

        // 5. Unblock User
        loginCheck2.isActive = true;
        await loginCheck2.save();
        console.log('Agent Unblocked.');

        // 6. Test Login (Simulate)
        const loginCheck3 = await User.findOne({ email });
        if (loginCheck3 && (await loginCheck3.matchPassword('password123'))) {
            if (!loginCheck3.isActive) console.log('Login 3 FAILED (Unexpected)');
            else console.log('Login 3 SUCCESS (Expected)');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('Test Error:', error);
        await mongoose.disconnect();
    }
};

testBlockUnblock();
