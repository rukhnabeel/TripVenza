const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    visaType: {
        type: String,
        required: true
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
            confidence: Number, // OCR confidence score (0-100)
            rawText: String, // Raw OCR extracted text
            verified: { type: Boolean, default: false }, // Whether data was verified by user
            extractedAt: Date
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Approved', 'Rejected', 'More Info Required'],
            default: 'Pending'
        }
    }],

    // Financials
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },

    // Tracking
    applicationId: { type: String, unique: true }, // Custom ID e.g., TV-2025-0001
    adminNotes: String,

}, { timestamps: true });

// Auto-generate readable Application ID
applicationSchema.pre('save', async function (next) {
    if (!this.applicationId) {
        const count = await this.constructor.countDocuments();
        this.applicationId = `TV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
