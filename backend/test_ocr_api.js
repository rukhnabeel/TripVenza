const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

dotenv.config();

// CONFIG
const IMAGE_PATH = 'C:/Users/Hasmat Ali/.gemini/antigravity/brain/5b7c08d5-5cee-4530-a9c9-ca1c4c5d602d/test_face_1768730430290.png';
const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('🔌 Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Create/Get User
        const email = 'ocr_tester@test.com';
        let user = await User.findOne({ email });
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                name: "OCR Tester",
                email,
                phone: "+9999999999",
                password: "hashed_placeholder",
                panNumber: "TESTP1234K",
                address: { street: "Test", city: "Test", state: "Test", zip: "111111", country: "India" },
                role: 'agent'
            });
        }

        // 2. Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('🔑 Token Generated');

        // 3. Test Validate Face
        console.log('\n📸 Testing /api/ocr/validate-face ...');
        if (!fs.existsSync(IMAGE_PATH)) {
            throw new Error(`Test image not found at ${IMAGE_PATH}`);
        }

        const form = new FormData();
        form.append('file', fs.createReadStream(IMAGE_PATH));

        try {
            const res = await axios.post(`${API_URL}/ocr/validate-face`, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('✅ Face Validation Success:', JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.error('❌ Face Validation Failed:', {
                message: err.message,
                code: err.code,
                status: err.response?.status,
                data: err.response?.data
            });
        }

        // 4. Test Passport OCR
        console.log('\n🛂 Testing /api/ocr/passport ...');
        const passportForm = new FormData();
        passportForm.append('passport', fs.createReadStream(IMAGE_PATH));

        try {
            const res = await axios.post(`${API_URL}/ocr/passport`, passportForm, {
                headers: {
                    ...passportForm.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('✅ Passport OCR Success:', JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.log('ℹ️ Passport OCR Response:', {
                message: err.message,
                code: err.code,
                status: err.response?.status,
                data: err.response?.data
            });
        }

    } catch (error) {
        console.error('🔥 Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runTest();
