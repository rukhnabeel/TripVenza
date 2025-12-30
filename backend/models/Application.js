const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    visaType: {
        type: String,
        required: true
    },

    // Feature: Group / Bulk Application
    isGroupApplication: { type: Boolean, default: false },
    groupName: String,
    groupReferenceId: { type: String },

    // Travel Details
    travelDate: Date, // Arrival
    returnDate: Date, // Departure

    // Status Timeline
    timeline: {
        submittedAt: Date,
        processingAt: Date, // Submission to Immigration
        approvedAt: Date,
        rejectedAt: Date,
        deliveredAt: Date // E-Visa delivery
    },

    // Feature: Pricing Snapshot (Audit Trail)
    pricingSnapshot: {
        govtFee: Number,
        serviceFee: Number,
        taxAmount: Number,
        totalAmount: Number,
        currency: String
    },

    // Applicant Details
    applicants: [{
        firstName: String,
        lastName: String,
        passportNumber: String,
        passportExpiry: Date,
        dateOfBirth: Date,
        nationality: String,
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        placeOfBirth: String,
        dateOfIssue: Date,
        placeOfIssue: String,
        passportIssuedCountry: String,
        fatherName: String,
        motherName: String,
        maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'] },
        address: String,

        documents: {
            passportFront: String, // URL
            passportBack: String,
            photo: String,
            other: [String]
        },
        // OCR Data
        ocrData: {
            extractedData: {
                firstName: String,
                lastName: String,
                passportNumber: String,
                passportExpiry: String,
                dateOfBirth: String,
                nationality: String,
                gender: String
            },
            confidence: Number,
            rawText: String,
            verified: { type: Boolean, default: false },
            extractedAt: Date
        },
        // Individual Applicant Tracking
        status: {
            type: String,
            enum: ['Pending', 'Submitted', 'In Embassy', 'Approved', 'Rejected', 'More Info Required'],
            default: 'Pending'
        },
        rejectionReason: String,
        embassyRefNumber: String,
        approvalFileUrl: String
    }],

    // Financials
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },

    // Status & Tracking
    status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Processing', 'Need More Info', 'Approved', 'Rejected', 'Partially Approved'],
        default: 'Pending'
    },

    applicationId: { type: String, unique: true }, // Custom ID e.g., TV-2025-0001
    adminNotes: String,

    // Application Level Rejection/Approval
    rejectionReason: String,
    approvedVisaDocument: {
        url: String, // Path to file
        uploadedAt: Date,
        originalName: String
    },

}, { timestamps: true });

// Auto-generate readable Application ID
applicationSchema.pre('save', async function () {
    if (!this.applicationId) {
        const count = await this.constructor.countDocuments();
        this.applicationId = `TV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
    }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
