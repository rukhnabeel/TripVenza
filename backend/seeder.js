const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Country = require('./models/Country');
const User = require('./models/User');

dotenv.config();
// connectDB(); // Removed

const countries = [
    {
        name: 'United Arab Emirates',
        code: 'AE',
        region: 'Middle East',
        flag: 'https://flagcdn.com/w320/ae.png',
        visaTypes: [
            {
                type: '30 Days Tourist Visa',
                processingTime: '24-48 Hours',
                validity: '58 Days',
                stayPeriod: '30 Days',
                entryType: 'Single',
                govtFee: 6500,
                serviceFee: 500,
                totalFee: 7000,
                documentsRequired: ['Passport Front (Color)', 'Passport Back (Color)', 'Passport Size Photo (White Background)'],
                description: 'Ideal for tourists and family visits.'
            },
            {
                type: '60 Days Tourist Visa',
                processingTime: '24-48 Hours',
                validity: '58 Days',
                stayPeriod: '60 Days',
                entryType: 'Single',
                govtFee: 12500,
                serviceFee: 500,
                totalFee: 13000,
                documentsRequired: ['Passport Front', 'Passport Back', 'Photo'],
                description: 'Perfect for longer stays and job seekers.'
            }
        ]
    },
    {
        name: 'Thailand',
        code: 'TH',
        region: 'Asia',
        flag: 'https://flagcdn.com/w320/th.png',
        visaTypes: [
            {
                type: 'Tourist Sticker Visa',
                processingTime: '4-5 Working Days',
                validity: '90 Days',
                stayPeriod: '60 Days',
                entryType: 'Single',
                govtFee: 2500,
                serviceFee: 500,
                totalFee: 3000,
                documentsRequired: ['Original Passport', 'Bank Statement (6 Months)', '2 Photos'],
                description: 'Standard sticker visa processed via embassy.'
            }
        ]
    },
    {
        name: 'Singapore',
        code: 'SG',
        region: 'Asia',
        flag: 'https://flagcdn.com/w320/sg.png',
        visaTypes: [
            {
                type: 'Tourist Visa',
                processingTime: '3-4 Working Days',
                validity: '5 Weeks - 2 Years',
                stayPeriod: '30 Days',
                entryType: 'Multiple',
                govtFee: 1800,
                serviceFee: 500,
                totalFee: 2300,
                documentsRequired: ['Form 14A', 'Passport Front/Back', 'Photo', 'Flight Tickets'],
                description: 'Electronic visa for tourism.'
            }
        ]
    }
];

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Country.deleteMany();
        await User.deleteMany();

        // Insert countries
        await Country.insertMany(countries);

        // Create test user
        const testUser = await User.create({
            name: 'Test Agent',
            email: 'agent@tripvenza.com',
            phone: '+919876543210',
            password: 'password123', // Will be hashed automatically by the pre-save hook
            agencyName: 'TripVenza Demo Agency',
            agencyType: 'Travel Agency',
            panNumber: 'ABCDE1234F',
            address: {
                street: '123 Main St',
                city: 'New Delhi',
                state: 'Delhi',
                zip: '110001',
                country: 'India'
            },
            isVerified: true,
            kycStatus: 'Approved',
            walletBalance: 50000,
            role: 'agent'
        });

        console.log('✅ Data Imported Successfully!');
        console.log('\n📧 Test Login Credentials:');
        console.log('Email: agent@tripvenza.com');
        console.log('Password: password123');
        console.log(`\n💰 Wallet Balance: ₹${testUser.walletBalance}\n`);

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

importData();
