const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const VisaCountry = require('./models/Country');

dotenv.config();

const API_URL = 'http://localhost:5000/api';
const PASSWORD = 'password123';

const generateEmail = () => `test_applicant_${Date.now()}@test.com`;

async function testVisaApplicationFlow() {
    try {
        console.log('🔄 Starting Visa Application Flow Test...');

        // Connect DB to manipulate wallet directly
        await connectDB();

        // 1. Create Agent directly in DB
        const agentEmail = generateEmail();
        console.log(`\n--- CREATING AGENT: ${agentEmail} ---`);

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        const newAgent = await User.create({
            name: 'Rich Agent',
            email: agentEmail,
            password: hashedPassword,
            phone: `9${Math.floor(Math.random() * 1000000000)}`,
            role: 'agent',
            agencyName: 'Rich Agency',
            agencyType: 'Travel Agency',
            gstNumber: 'GST12345',
            panNumber: 'PAN12345',
            address: { street: 'Main St', city: 'Mumbai', state: 'Maharashtra', zip: '400001', country: 'India' },
            kycStatus: 'Approved',
            isActive: true,
            walletBalance: 10000, // START WITH MONEY
            documents: {
                panCard: { url: '/mock.jpg', uploadedAt: new Date() },
                addressProof: { url: '/mock.jpg', uploadedAt: new Date(), type: 'Electricity Bill' }
            }
        });

        console.log(`✅ Agent Created with ₹10,000 Balance. ID: ${newAgent._id}`);

        // 2. Login to get Token
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: agentEmail, password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('✅ Agent Logged In');

        // 3. Fetch Visa Products
        console.log('\n--- FETCHING PRODUCTS ---');
        const countriesRes = await axios.get(`${API_URL}/visa/countries`);
        if (countriesRes.data.length === 0) {
            throw new Error('No countries found in DB. Please run seed script first.');
        }
        const country = countriesRes.data[0];
        const visaType = country.visaTypes[0];

        console.log(`ℹ️  Selected: ${country.name} - ${visaType.type} (Cost: ₹${visaType.totalFee})`);

        // 4. Submit Application
        console.log('\n--- SUBMITTING APPLICATION ---');
        const payload = {
            countryId: country._id,
            visaType: visaType.type,
            applicants: [
                {
                    firstName: "John", lastName: "Doe",
                    passportNumber: "Z1234567",
                    passportExpiry: "2030-01-01",
                    dateOfBirth: "1990-01-01",
                    nationality: "Indian",
                    gender: "Male",
                    maritalStatus: "Single",
                    placeOfBirth: "Mumbai",
                    dateOfIssue: "2020-01-01",
                    placeOfIssue: "Mumbai",
                    fatherName: "Father Doe",
                    motherName: "Mother Doe",
                    addressLine1: "123 Street",
                    state: "Maharashtra",
                    city: "Mumbai",
                    pinCode: "400001",
                    documents: {
                        passportFront: "/uploads/mock.jpg",
                        passportBack: "/uploads/mock.jpg",
                        photo: "/uploads/mock.jpg"
                    }
                }
            ],
            paymentMethod: 'Wallet'
        };

        const appRes = await axios.post(`${API_URL}/applications`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const appId = appRes.data.applicationId;
        console.log(`✅ Application Submitted. ID: ${appId}`);

        // 5. Verify Wallet Deduction
        console.log('\n--- VERIFYING WALLET DEDUCTION ---');
        // Fetch fresh user data from DB
        const updatedAgent = await User.findById(newAgent._id);
        const expectedBalance = 10000 - visaType.totalFee;

        console.log(`Initial: ₹10,000 | Cost: ₹${visaType.totalFee} | Expected: ₹${expectedBalance} | Actual: ₹${updatedAgent.walletBalance}`);

        if (updatedAgent.walletBalance === expectedBalance) {
            console.log('✅ Wallet Balance Correct');
        } else {
            console.error('❌ Wallet Balance Incorrect!');
        }

        // 6. Verify Application in DB
        const listRes = await axios.get(`${API_URL}/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const myApp = listRes.data.applications.find(a => a.applicationId === appId);
        if (myApp && myApp.paymentStatus === 'Paid') {
            console.log('✅ Application found in list with Paid status');
        } else {
            console.error('❌ Application not found or not paid');
        }

        // Cleanup
        await User.findByIdAndDelete(newAgent._id);
        console.log('\n✅ Test Agent Deleted');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Stack:', error.stack);
        }
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testVisaApplicationFlow();
