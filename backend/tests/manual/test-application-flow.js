const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('🚀 Starting Application Flow Test...');

        // 1. Login as Admin (to add money)
        console.log('\n🔐 Logging in as Admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripvenza.com',
            password: 'admin123'
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Logged In');

        // 2. Login as Agent
        console.log('\n🔐 Logging in as Agent...');
        const agentLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'agent@tripvenza.com',
            password: 'password123'
        });
        const agentToken = agentLogin.data.token;
        const agentId = agentLogin.data.user._id;
        console.log(`✅ Agent Logged In (${agentLogin.data.user.name})`);
        console.log(`💰 Current Balance: ₹${agentLogin.data.user.walletBalance}`);

        // 3. Ensure Sufficient Balance (Add ₹10,000)
        if (agentLogin.data.user.walletBalance < 10000) {
            console.log('\n💸 Adding Money to Agent Wallet...');
            // Step A: Agent requests money
            const addReq = await axios.post(`${API_URL}/wallet/add`, {
                amount: 10000,
                utrNumber: `UTR-TEST-${Date.now()}`
            }, { headers: { Authorization: `Bearer ${agentToken}` } });

            // Step B: Admin approves it
            await axios.patch(`${API_URL}/wallet/${addReq.data.requestId}/verify`, {
                status: 'Approved'
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('✅ Wallet Balance Top-up Successful');
        }

        // 4. Fetch Countries to find a valid Visa Type
        console.log('\n🌍 Fetching Visa Countries...');
        const countriesRes = await axios.get(`${API_URL}/visa/countries`, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });

        console.log(`Debug: /api/visa/countries returned ${countriesRes.data.length} items.`);

        // Debug fallback
        if (countriesRes.data.length === 0) {
            console.log('⚠️ /api/visa/countries is empty. Trying /api/countries...');
            const adminCountriesRes = await axios.get(`${API_URL}/countries`);
            console.log(`Debug: /api/countries returned ${adminCountriesRes.data.length} items.`);
        }

        if (countriesRes.data.length === 0) {
            throw new Error('No countries found in DB (filtered). Please seed countries.');
        }

        const countrySummary = countriesRes.data[0];
        console.log(`✅ Selected Country (Summary): ${countrySummary.name}`);

        // Fetch Full Details
        console.log(`\n🔍 Fetching Details for ${countrySummary.name}...`);
        const detailRes = await axios.get(`${API_URL}/visa/countries/${countrySummary._id}`, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });
        const country = detailRes.data;

        if (!country.visaTypes || country.visaTypes.length === 0) {
            throw new Error('No visa types found for this country.');
        }

        const visa = country.visaTypes[0];
        console.log(`✅ Selected Visa: ${visa.type} (Fee: ₹${visa.totalFee})`);

        // 5. Submit Application
        console.log('\n📝 Submitting Visa Application...');
        const applicantData = {
            firstName: 'John',
            lastName: 'Doe',
            passportNumber: 'Z1234567',
            passportExpiry: '01/01/2030',
            dateOfBirth: '01/01/1990',
            nationality: 'Indian',
            gender: 'Male',
            placeOfBirth: 'Mumbai',
            dateOfIssue: '01/01/2020',
            placeOfIssue: 'Mumbai',
            fatherName: 'Robert Doe',
            motherName: 'Mary Doe',
            maritalStatus: 'Single',
            addressLine1: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400001',
            documents: {
                passportFront: '/uploads/mock-passport-front.jpg',
                passportBack: '/uploads/mock-passport-back.jpg',
                photo: '/uploads/mock-photo.jpg'
            }
        };

        const payload = {
            countryId: country._id,
            visaType: visa.type,
            applicants: [applicantData],
            isGroupApplication: false
        };

        const submitRes = await axios.post(`${API_URL}/applications`, payload, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });

        console.log('✅ Application Submitted Successfully!');
        console.log(`🆔 Application ID: ${submitRes.data.applicationId}`);
        console.log(`💰 Remaining Balance: ₹${submitRes.data.remainingBalance}`);

        // 6. Verify Application in List
        console.log('\n🔍 Verifying Application in List...');
        const listRes = await axios.get(`${API_URL}/applications`, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });

        const myApp = listRes.data.find(a => a.applicationId === submitRes.data.applicationId);
        if (myApp) {
            console.log(`✅ Found Application:Status ${myApp.status}`);
        } else {
            throw new Error('Application not found in list!');
        }

        console.log('\n🎉 TEST PASSED: Visa Application Flow is Working!');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
};

runTest();
