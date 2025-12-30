const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

const testRegistration = async () => {
    try {
        console.log('--- Starting Registration Flow Test ---');

        const uniqueSuffix = Date.now();
        const email = `regtest${uniqueSuffix}@tripvenza.com`;

        // Dynamically import FormData if needed, but in Node 18+ it's global
        // If not global, we might fail. Let's try to use axios to handle it if we pass streams?
        // Actually, axios in node needs 'form-data' package explicitly for streams usually, 
        // OR we can try to import it if it exists.

        let FormData;
        try {
            FormData = require('form-data');
        } catch (e) {
            console.log(" 'form-data' package not found. Using global FormData if available...");
            if (typeof global.FormData === 'undefined') {
                console.error("Global FormData not found and package missing. Cannot run test.");
                process.exit(1);
            }
            FormData = global.FormData;
        }

        const form = new FormData();

        // Fields
        form.append('name', 'Registration Test Agent');
        form.append('email', email);
        form.append('phone', '9876543210');
        form.append('password', 'password123');
        form.append('agencyName', `Test Agency ${uniqueSuffix}`);
        form.append('agencyType', 'Travel Agency');
        form.append('gstNumber', '22AAAAA0000A1Z5');
        form.append('panNumber', 'ABCDE1234F');
        form.append('address', JSON.stringify({ street: '123 Test St', city: 'Test City', state: 'Delhi', zip: '110001', country: 'India' }));
        form.append('businessRegistration', JSON.stringify({ registrationNumber: 'REG123' }));
        form.append('bankDetails', JSON.stringify({ accountName: 'Test Agency', accountNumber: '1234567890', ifsc: 'SBIN0000001', bankName: 'SBI' }));

        // Files
        // Note: For 'form-data' package, fs.createReadStream works. 
        // For native FormData, checking implementation details is tricky.
        // Let's assume 'form-data' might NOT be there, but we can try to require it.
        // Actually, 'axios' depends on 'form-data' internally usually? No, it's a peer dep or separate.

        // Let's rely on axios to handle it if we construct the form correctly.
        // If form-data is missing, this might fail unless Node is new.

        const panStream = fs.createReadStream(path.join(__dirname, 'temp_docs', 'pan.jpg'));
        const aadhaarStream = fs.createReadStream(path.join(__dirname, 'temp_docs', 'aadhaar.jpg'));
        const addressStream = fs.createReadStream(path.join(__dirname, 'temp_docs', 'address.jpg'));

        form.append('panCard', panStream);
        form.append('aadhaarCard', aadhaarStream);
        form.append('addressProof', addressStream);
        // addressProofType is optional, text field
        form.append('addressProofType', 'Electricity Bill');

        console.log(`\n[1] Registering Agent: ${email}...`);

        // For axios with form-data, we need correct headers
        const headers = form.getHeaders ? form.getHeaders() : { 'Content-Type': 'multipart/form-data' };

        const response = await axios.post(`${API_URL}/auth/register`, form, {
            headers: {
                ...headers
            }
        });

        console.log(`✓ Registration Successful! Status: ${response.status}`);
        console.log(`✓ Token received: ${!!response.data.token}`);
        console.log(`✓ User ID: ${response.data._id}`);

        // Verify Login with new creds
        console.log('\n[2] Verifying Login with new credentials...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: 'password123'
        });

        console.log(`✓ Login Successful! Welcome ${loginRes.data.user.name}`);
        console.log('\n✅ TEST PASSED: Registration Flow verified!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
            if (error.stack) console.error(error.stack);
        }
        process.exit(1);
    }
};

testRegistration();
