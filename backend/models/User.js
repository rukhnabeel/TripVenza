const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Personal Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role & Permissions
    role: {
        type: String,
        enum: ['admin', 'agent', 'sub-agent', 'user'],
        default: 'agent'
    },

    avatar: { type: String }, // User Profile Picture

    // Agent Business Details
    agencyName: { type: String },
    agencyType: { type: String, enum: ['Travel Agency', 'Freelancer', 'Corporate', 'Tour Operator', 'Visa Consultant'] },
    gstNumber: { type: String },
    panNumber: { type: String, required: true }, // Mandatory

    // Mandatory Address
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'India', required: true }
    },

    // Business Registration Details
    businessRegistration: {
        registrationNumber: String,
        registrationType: { type: String, enum: ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Public Limited'] },
        registrationDate: Date,
        certificateUrl: String
    },

    // Bank Details
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        branchName: String,
        cancelledChequeUrl: String
    },

    // KYC & Verification
    isVerified: { type: Boolean, default: false },
    kycStatus: {
        type: String,
        enum: ['Pending', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    kycSubmittedAt: Date,
    kycApprovedAt: Date,
    kycRejectionReason: String,

    // Comprehensive Documents
    documents: {
        // Mandatory Documents
        panCard: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },

        // Business Documents
        gstCertificate: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },
        businessRegistrationCertificate: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },

        // Owner/Director Documents
        ownerAadhar: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },
        ownerPhoto: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },
        ownerPan: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },

        // Director Documents (for companies)
        directorDocuments: [{
            name: String,
            designation: String,
            aadharUrl: String,
            panUrl: String,
            photoUrl: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date
        }],

        // Additional Documents
        tradeLicense: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },
        iataLicense: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },
        cancelledCheque: {
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },

        // Address Proof
        addressProof: {
            url: String,
            type: { type: String, enum: ['Electricity Bill', 'Rent Agreement', 'Property Tax Receipt', 'Bank Statement', 'Shop Establishment Certificate / Registration Certificate'] },
            verified: { type: Boolean, default: false },
            uploadedAt: Date,
            verifiedAt: Date
        },

        // Other Documents
        otherDocuments: [{
            name: String,
            url: String,
            uploadedAt: Date
        }]
    },

    // Feature: Agent Tiering
    tier: {
        type: String,
        enum: ['Silver', 'Gold', 'Platinum'],
        default: 'Silver'
    },

    // Feature: Auto-Tiering Logic
    performanceMetrics: {
        totalFilesProcessed: { type: Number, default: 0 },
        totalSpentLastMonth: { type: Number, default: 0 },
        lastTierUpdate: Date
    },

    // Feature: Sub-Accounts (Staff)
    parentAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // If this user is staff of another agent
    permissions: [{ type: String }], // e.g. ['create_application', 'view_wallet']

    // Wallet
    walletBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },

    isActive: { type: Boolean, default: true },

    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
    },

}, { timestamps: true });

// Encrypt password before save - REMOVED TO FIX SEEDER ISSUE. HASH MANUALLY IN CONTROLLER.

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
