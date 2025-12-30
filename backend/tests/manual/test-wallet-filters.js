const mongoose = require('mongoose');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const testWalletFilters = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Get Admin Token
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('No admin found! cannot run test.');
            process.exit(1);
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        const api = axios.create({
            baseURL: 'http://localhost:5000/api',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('--- Testing Wallet Filters ---');

        // Test 1: No Filters
        console.log('\n1. Fetching All Requests...');
        try {
            const res1 = await api.get('/wallet/requests');
            console.log(`   Count: ${res1.data.length}`);
        } catch (e) { console.error(e.response?.data || e.message); }

        // Test 2: Filter by Status 'Pending'
        console.log('\n2. Filtering Status=Pending...');
        try {
            const res2 = await api.get('/wallet/requests?status=Pending');
            console.log(`   Count: ${res2.data.length}`);
            const nonPending = res2.data.filter(t => t.status !== 'Pending');
            if (nonPending.length === 0) console.log('   PASS: Only Pending transactions returned');
            else console.log('   FAIL: Non-pending transactions found', nonPending.map(t => t.status));
        } catch (e) { console.error(e.response?.data || e.message); }

        // Test 2b: Filter by Status 'Success'
        console.log('\n2b. Filtering Status=Success...');
        try {
            const res2b = await api.get('/wallet/requests?status=Success');
            console.log(`   Count: ${res2b.data.length}`);
            const nonSuccess = res2b.data.filter(t => t.status !== 'Success');
            if (nonSuccess.length === 0) console.log('   PASS: Only Success transactions returned');
            else console.log('   FAIL: Non-success transactions found', nonSuccess.map(t => t.status));
        } catch (e) { console.error(e.response?.data || e.message); }

        // Test 3: Search (Random string)
        console.log('\n3. Searching for "NON_EXISTENT_UTR"...');
        try {
            const res3 = await api.get('/wallet/requests?search=NON_EXISTENT_UTR');
            console.log(`   Count: ${res3.data.length} (Expected: 0)`);
        } catch (e) { console.error(e.response?.data || e.message); }

        await mongoose.disconnect();

    } catch (error) {
        console.error('Test Script Error:', error);
    }
};

testWalletFilters();
