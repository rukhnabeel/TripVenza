const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Application = require('../../models/Application');
const User = require('../../models/User'); // Ensure User model is loaded
const Country = require('../../models/Country'); // Ensure Country model is loaded

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testGetApplications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Find an Agent
        const agent = await User.findOne({ role: 'agent' });
        if (!agent) {
            console.log('No agent found');
            process.exit(0);
        }
        console.log('Testing with Agent:', agent.email, agent._id);

        // 2. Run the exact query from controller
        console.log('Running Application.find...');
        const applications = await Application.find({ agent: agent._id })
            .populate('country', 'name flag')
            .populate('agent', 'name agencyName email phone')
            .sort({ createdAt: -1 });

        console.log(`Found ${applications.length} applications`);
        if (applications.length > 0) {
            console.log('Sample App:', JSON.stringify(applications[0], null, 2));
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testGetApplications();
