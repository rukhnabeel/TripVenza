const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const createAgent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Use a real file we saw in uploads list for testing downloads
        // passport-1766318898396-104855854.jpg
        const dummyDocUrl = '/uploads/passport-1766318898396-104855854.jpg';

        const agent = await User.create({
            name: "Pending Verification Agent",
            email: "pending_verify@tripvenza.com",
            phone: "+919876543299",
            password: "hashed_password_placeholder",
            agencyName: "Verify Me Travels",
            agencyType: "Travel Agency",
            panNumber: "VERIFY1234",
            address: {
                street: "12 Verification Lane",
                city: "Test City",
                state: "Test State",
                zip: "100001",
                country: "India"
            },
            role: "agent",
            kycStatus: "Pending",
            documents: {
                panCard: {
                    url: dummyDocUrl,
                    verified: false,
                    uploadedAt: new Date()
                },
                gstCertificate: {
                    url: dummyDocUrl,
                    verified: false,
                    uploadedAt: new Date()
                },
                addressProof: {
                    url: dummyDocUrl,
                    type: "Electricity Bill",
                    verified: false,
                    uploadedAt: new Date()
                }
            }
        });

        console.log(`✅ Created Pending Agent: ${agent.email}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAgent();
