const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const OTP = require('./models/OTP');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@tripvenza.com';
const ORIGINAL_PASS = 'password123'; // Assuming this is current
const NEW_PASS = 'resetPass789';

async function testPasswordReset() {
    try {
        console.log('🔄 Starting Password Recovery Test...');

        // Connect to DB directly to fetch OTP (since we can't see server logs here easily)
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB for OTP spying');

        // 1. Request Forgot Password
        console.log(`\n1. Requesting OTP for ${EMAIL}...`);
        await axios.post(`${API_URL}/auth/forgot-password`, { email: EMAIL });
        console.log('✅ Forgot Password Request Sent');

        // 2. Spy on OTP from DB (Wait a bit for DB update)
        await new Promise(r => setTimeout(r, 1000));
        const otpRecord = await OTP.findOne({ identifier: EMAIL, type: 'password_reset' }).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw new Error('❌ OTP not found in DB! Controller might have failed.');
        }
        const otpCode = otpRecord.otp;
        console.log(`✅ [SPY] Found OTP in DB: ${otpCode}`);

        // 3. Reset Password
        console.log(`\n2. Resetting password with OTP...`);
        const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
            email: EMAIL,
            otp: otpCode,
            newPassword: NEW_PASS
        });
        console.log(`✅ ${resetRes.data.message}`);

        // 4. Verify Login with New Password
        console.log(`\n3. Verifying Login with NEW password...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: NEW_PASS
        });
        console.log(`✅ Login Success! Token received: ${loginRes.data.token.substring(0, 10)}...`);

        // 5. Cleanup: Revert Password
        console.log(`\n4. Reverting password to '${ORIGINAL_PASS}'...`);
        const revertToken = loginRes.data.token;
        await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${revertToken}` } }); // Just verification

        // Use the profile update route we tested before to reset pass, or just do another reset flow?
        // Let's use the profile update route since we are logged in.
        await axios.put(`${API_URL}/users/profile/password`, {
            currentPassword: NEW_PASS,
            newPassword: ORIGINAL_PASS
        }, { headers: { Authorization: `Bearer ${revertToken}` } });

        console.log('✅ Password Reverted Successfully');

    } catch (error) {
        console.error('❌ Reset Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testPasswordReset();
