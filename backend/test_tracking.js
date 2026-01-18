const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function testTracking() {
    try {
        console.log('🔄 Starting Public Tracking Test...');

        // 1. Get a valid Application ID (Need admin/agent login just to find one)
        // In a real scenario, the user would know their ID. Here we "cheat" to get a valid one.
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'agent@tripvenza.com', password: 'password123'
        });
        const token = loginRes.data.token;

        const listRes = await axios.get(`${API_URL}/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (listRes.data.applications.length === 0) {
            console.error('❌ No applications found to track. Run seeder or create one first.');
            return;
        }

        const validAppId = listRes.data.applications[0].applicationId;
        console.log(`ℹ️  Found valid Application ID: ${validAppId}`);

        // 2. Track WITHOUT Authentication
        console.log(`🔍 Attempting to track ${validAppId} publicly...`);
        const trackRes = await axios.get(`${API_URL}/applications/track/${validAppId}`); // No headers

        console.log('✅ Public API Response Received:');
        console.log(`   - ID: ${trackRes.data.applicationId}`);
        console.log(`   - Status: ${trackRes.data.status}`);
        console.log(`   - Country: ${trackRes.data.country.name}`);

        // Verify response structure (should have masked applicants)
        const applicant = trackRes.data.applicants[0];
        if (applicant.lastName.includes('***') || applicant.passportNumber.includes('***')) {
            console.log('✅ Data Masking Verified (Sensitive info hidden)');
        } else {
            console.error('❌ Data Masking FAILED! Sensitive info exposed.');
        }

    } catch (error) {
        console.error('❌ Tracking Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

testTracking();
