const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const OTP = require('./models/OTP');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test Data
        const email = 'verify@example.com';
        const mobile = '+919988776655';

        // --- EMAIL OTP TEST ---
        console.log('\n📧 Testing EMAIL OTP...');

        // 1. Send OTP
        await axios.post(`${API_URL}/auth/send-otp`, { identifier: email, type: 'email' });
        console.log(' - Send OTP Request: Success');

        // 2. Fetch OTP from DB
        // Wait a bit for DB propagation if needed, but usually instant
        const emailOtpRecord = await OTP.findOne({ identifier: email, type: 'email' });
        if (!emailOtpRecord) throw new Error('Email OTP not found in DB');
        console.log(` - Fetched OTP from DB: ${emailOtpRecord.otp}`);

        // 3. Verify OTP
        const emailVerifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            identifier: email,
            type: 'email',
            otp: emailOtpRecord.otp
        });
        console.log(` - Verify OTP Request: ${emailVerifyRes.data.message}`);

        // 4. Check Verified Status in DB
        const emailOtpUpdated = await OTP.findOne({ identifier: email, type: 'email' });
        if (emailOtpUpdated.verified) {
            console.log('✅ Email OTP Flow Passed');
        } else {
            console.error('❌ Email OTP Verified Flag Not Set');
        }


        // --- MOBILE OTP TEST ---
        console.log('\n📱 Testing MOBILE OTP...');

        // 1. Send OTP
        await axios.post(`${API_URL}/auth/send-otp`, { identifier: mobile, type: 'mobile' });
        console.log(' - Send OTP Request: Success');

        // 2. Fetch OTP from DB
        const mobileOtpRecord = await OTP.findOne({ identifier: mobile, type: 'mobile' });
        if (!mobileOtpRecord) throw new Error('Mobile OTP not found in DB');
        console.log(` - Fetched OTP from DB: ${mobileOtpRecord.otp}`);

        // 3. Verify OTP
        const mobileVerifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            identifier: mobile,
            type: 'mobile',
            otp: mobileOtpRecord.otp
        });
        console.log(` - Verify OTP Request: ${mobileVerifyRes.data.message}`);

        // 4. Check Verified Status in DB
        const mobileOtpUpdated = await OTP.findOne({ identifier: mobile, type: 'mobile' });
        if (mobileOtpUpdated.verified) {
            console.log('✅ Mobile OTP Flow Passed');
        } else {
            console.error('❌ Mobile OTP Verified Flag Not Set');
        }

        console.log('\n🎉 ALL OTP TESTS PASSED');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

runTest();
