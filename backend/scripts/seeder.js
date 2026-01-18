const dotenv = require('dotenv');
const connectDB = require('../config/db');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Country = require('../models/Country');
const User = require('../models/User');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

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
                baseServiceFee: 500,
                tieredServiceFees: {
                    silver: 500,
                    gold: 400,
                    platinum: 300
                },
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
                baseServiceFee: 500,
                tieredServiceFees: {
                    silver: 500,
                    gold: 400,
                    platinum: 300
                },
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
                baseServiceFee: 500,
                tieredServiceFees: {
                    silver: 500,
                    gold: 400,
                    platinum: 300
                },
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
                baseServiceFee: 500,
                tieredServiceFees: {
                    silver: 500,
                    gold: 400,
                    platinum: 300
                },
                totalFee: 2300,
                documentsRequired: ['Form 14A', 'Passport Front/Back', 'Photo', 'Flight Tickets'],
                description: 'Electronic visa for tourism.'
            }
        ]
    },
];

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Application.deleteMany();
        await Transaction.deleteMany();
        await Country.deleteMany();
        await User.deleteMany();

        // Insert countries
        await Country.insertMany(countries);

        // Create test user
        const testUser = await User.create({
            name: 'Test Agent',
            email: 'agent@tripvenza.com',
            phone: '+919876543210',
            password: await bcrypt.hash('password123', 10),
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
            role: 'agent',
            tier: 'Silver',
            currency: 'INR'
        });

        // Create Admin User
        await User.create({
            name: 'Super Admin',
            email: 'admin@tripvenza.com',
            phone: '+919999999999',
            password: await bcrypt.hash('password123', 10),
            agencyName: 'TripVenza HQ',
            agencyType: 'Corporate',
            panNumber: 'ADMIN1234X',
            address: {
                street: 'HQ St',
                city: 'Dubai',
                state: 'Dubai',
                zip: '00000',
                country: 'United Arab Emirates'
            },
            isVerified: true,
            kycStatus: 'Approved',
            walletBalance: 1000000,
            role: 'admin',
            tier: 'Platinum',
            currency: 'INR'
        });

        // Create Seed Application (UAE 30 Days)
        const uae = await Country.findOne({ code: 'AE' });
        const visa = uae.visaTypes[0]; // 30 Days

        await Application.create({
            agent: testUser._id,
            country: uae._id,
            visaType: visa.type,
            applicants: [
                {
                    firstName: "Rahul",
                    lastName: "Sharma",
                    passportNumber: "Z1234567",
                    dateOfBirth: new Date("1990-01-01"),
                    passportExpiry: new Date("2030-01-01"),
                    gender: "Male",
                    nationality: "Indian",
                    status: "Submitted"
                }
            ],
            totalAmount: visa.totalFee,
            paymentStatus: "Paid",
            status: "Submitted",
            pricingSnapshot: {
                govtFee: visa.govtFee,
                serviceFee: visa.baseServiceFee,
                taxAmount: 0,
                totalAmount: visa.totalFee,
                currency: "INR"
            }
        });

        console.log('✅ Data Imported Successfully!');
        console.log('\n📧 Test Login Credentials:');
        console.log('Email: agent@tripvenza.com');
        console.log('Password: password123');
        console.log('\n👑 Admin Credentials:');
        console.log('Email: admin@tripvenza.com');
        console.log('Password: password123');
        console.log(`\n💰 Wallet Balance: ₹${testUser.walletBalance}\n`);

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

importData();
