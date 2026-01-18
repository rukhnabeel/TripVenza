const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://127.0.0.1:5000/api';
const ADMIN_EMAIL = 'admin@tripvenza.com';
const ADMIN_PASSWORD = 'password123';

// Pick the first available passport image from uploads (or a specific one if known)
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const runVerification = async () => {
    try {
        console.log('--- OCR Verification Start ---');

        // 1. Find a test image
        const files = fs.readdirSync(UPLOADS_DIR);
        const passportFile = files.find(f => f.startsWith('passport-') && f.endsWith('.jpg'));

        if (!passportFile) {
            console.error('❌ No test passport image found in backend/uploads. Please add one to run this test.');
            return;
        }

        const filePath = path.join(UPLOADS_DIR, passportFile);
        console.log(`Using Test Image: ${passportFile}`);

        // 2. Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in.');

        // 3. Test OCR Endpoint
        console.log('Sending Image to OCR Engine...');
        const form = new FormData();
        form.append('passport', fs.createReadStream(filePath));

        const uploadConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            }
        };

        try {
            const response = await axios.post(`${API_URL}/ocr/passport?advanced=true`, form, uploadConfig);
            console.log('✅ OCR Response Received:');
            console.log('Success:', response.data.success);
            console.log('MRZ Parsed:', response.data.mrzParsed);
            console.log('Data:', JSON.stringify(response.data.data, null, 2));

            if (response.data.mrzParsed && response.data.data.passportNumber) {
                console.log('✅ OCR Verification PASSED: MRZ data extracted.');
            } else {
                console.warn('⚠️ OCR Verification WARNING: MRZ not parsed or incomplete data.');
            }

        } catch (ocrError) {
            console.error('❌ OCR Request Failed:');
            if (ocrError.response) {
                console.error('Status:', ocrError.response.status);
                console.error('FULL ERROR DATA:', JSON.stringify(ocrError.response.data, null, 2));
            } else {
                console.error(ocrError.message);
            }
        }

    } catch (error) {
        console.error('Test Setup Error:', error.message);
    }
};

runVerification();
