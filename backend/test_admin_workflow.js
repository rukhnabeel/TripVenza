const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const AGENT_EMAIL = 'agent@tripvenza.com';
const ADMIN_EMAIL = 'admin@tripvenza.com';
const PASSWORD = 'password123';

async function testAdminFlow() {
    try {
        console.log('🔄 Starting Admin Workflow Test...');

        // 1. Agent Login & Submission
        console.log('\n--- AGENT ACTIONS ---');
        const agentLogin = await axios.post(`${API_URL}/auth/login`, {
            email: AGENT_EMAIL, password: PASSWORD
        });
        const agentToken = agentLogin.data.token;
        console.log('✅ Agent Logged In');

        // Get Country
        const countries = await axios.get(`${API_URL}/visa/countries`);
        const country = countries.data[0];

        // Submit Application
        const payload = {
            countryId: country._id,
            visaType: country.visaTypes[0].type,
            applicants: [{
                firstName: 'AdminTest', lastName: 'Subject',
                passportNumber: 'ADM999888',
                passportExpiry: '2030-01-01', dateOfBirth: '1995-01-01',
                nationality: 'Indian', gender: 'Male', maritalStatus: 'Single',
                placeOfBirth: 'Delhi', dateOfIssue: '2020-01-01', placeOfIssue: 'Delhi',
                fatherName: 'F', motherName: 'M', address: 'Addr'
            }],
            totalAmount: country.visaTypes[0].totalFee,
            paymentMethod: 'Wallet'
        };

        const createRes = await axios.post(`${API_URL}/applications`, payload, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });
        const appId = createRes.data.applicationId;
        console.log(`✅ Application Submitted: ${appId}`);

        // Get ID (we need _id for admin update, usually response gives appId string)
        // Let's fetch my applications to get the _id
        const myApps = await axios.get(`${API_URL}/applications?search=${appId}`, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });
        const fullApp = myApps.data.applications[0];
        const appMongoId = fullApp._id;
        console.log(`ℹ️  Application Mongo ID: ${appMongoId}`);


        // 2. Admin Actions
        console.log('\n--- ADMIN ACTIONS ---');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL, password: PASSWORD
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Logged In');

        // Fetch as Admin
        const adminView = await axios.get(`${API_URL}/applications/${appMongoId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`ℹ️  Admin fetched app status: ${adminView.data.status}`);

        // Reject Application
        console.log('🛑 Rejecting Application...');
        const rejectRes = await axios.put(`${API_URL}/applications/${appMongoId}/status`, {
            status: 'Rejected',
            rejectionReason: 'Test Auto-Rejection Script'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (rejectRes.data.application.status === 'Rejected') {
            console.log('✅ Application Rejected Successfully');
        } else {
            console.error('❌ Failed to Reject');
        }

        // Verify status persists
        const finalCheck = await axios.get(`${API_URL}/applications/${appMongoId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`ℹ️  Final Status: ${finalCheck.data.status}`);
        console.log(`ℹ️  Rejection Reason: ${finalCheck.data.rejectionReason}`);

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.stack);
    }
}

testAdminFlow();
