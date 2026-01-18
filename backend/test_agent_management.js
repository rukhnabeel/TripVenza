const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@tripvenza.com';
const PASSWORD = 'password123';

const generateEmail = () => `test_agent_${Date.now()}@test.com`;

async function testAgentManagement() {
    try {
        console.log('🔄 Starting Agent Management Test (Direct DB Register)...');

        // Connect DB
        await connectDB();

        // 1. Create Agent directly in DB
        const agentEmail = generateEmail();
        console.log(`\n--- CREATING AGENT IN DB: ${agentEmail} ---`);

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        const newAgent = await User.create({
            name: 'DirectTest Agent',
            email: agentEmail,
            password: hashedPassword,
            phone: '1231231234',
            role: 'agent',
            agencyName: 'Direct Test Agency',
            agencyType: 'Travel Agency',
            gstNumber: 'GST12345',
            panNumber: 'PAN12345',
            address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zip: '110001',
                country: 'India'
            },
            kycStatus: 'Pending', // Start as Pending
            isActive: true, // Default active
            documents: {
                panCard: { url: '/uploads/mock_pan.jpg', uploadedAt: new Date() },
                addressProof: { url: '/uploads/mock_addr.jpg', uploadedAt: new Date(), type: 'Electricity Bill' }
            }
        });

        console.log(`✅ Agent Created. ID: ${newAgent._id}`);
        const agentId = newAgent._id;

        // 2. Admin Login
        console.log('\n--- ADMIN LOGIN ---');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL, password: PASSWORD
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Logged In');

        // 3. Fetch Agents & Verify Newly Created Agent is visible
        console.log('\n--- FETCHING AGENTS ---');
        const agentsRes = await axios.get(`${API_URL}/users/agents`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // Note: agentsRes.data is array of objects. _id is string or ObjectId (but usually JSON string)
        const foundAgent = agentsRes.data.find(a => a._id === agentId.toString());

        if (foundAgent) {
            console.log(`✅ Found new agent in list. Status: ${foundAgent.kycStatus}`);
        } else {
            // Debug info
            console.log('List IDs:', agentsRes.data.map(a => a._id));
            throw new Error('New agent not found in admin list');
        }

        // 4. Approve Agent
        console.log('\n--- APPROVING AGENT ---');
        await axios.patch(`${API_URL}/users/${agentId}/status`, {
            action: 'approve'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Approve Request Sent');

        // Verify
        const verifyApprove = await axios.get(`${API_URL}/users/agents`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const approvedAgent = verifyApprove.data.find(a => a._id === agentId.toString());
        if (approvedAgent.kycStatus === 'Approved') {
            console.log('✅ Agent Status verified as Approved');
        } else {
            console.error(`❌ Status mismatch: ${approvedAgent.kycStatus}`);
        }

        // 5. Block Agent
        console.log('\n--- BLOCKING AGENT ---');
        await axios.patch(`${API_URL}/users/${agentId}/status`, {
            action: 'block'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        // Verify
        const verifyBlock = await axios.get(`${API_URL}/users/agents`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const blockedAgent = verifyBlock.data.find(a => a._id === agentId.toString());
        if (blockedAgent.isActive === false) {
            console.log('✅ Agent verified as Blocked (isActive: false)');
        } else {
            console.error(`❌ Block failed: isActive is ${blockedAgent.isActive}`);
        }

        // 6. Tier Update
        console.log('\n--- UPDATING TIER ---');
        await axios.patch(`${API_URL}/users/${agentId}/tier`, {
            tier: 'Platinum'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // Verify
        const verifyTier = await axios.get(`${API_URL}/users/agents`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const platinumAgent = verifyTier.data.find(a => a._id === agentId.toString());
        if (platinumAgent.tier === 'Platinum') {
            console.log('✅ Agent Tier verified as Platinum');
        } else {
            console.error(`❌ Tier mismatch: ${platinumAgent.tier}`);
        }

        // Cleanup
        await User.findByIdAndDelete(agentId);
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

testAgentManagement();
