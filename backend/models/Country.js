const mongoose = require('mongoose');

const visaTypeSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., '30 Days Tourist', '90 Days Business'
    processingTime: { type: String, required: true }, // e.g., '2-3 Working Days'
    validity: { type: String, required: true }, // e.g., '58 Days'
    stayPeriod: { type: String, required: true }, // e.g., '30 Days'
    entryType: { type: String, enum: ['Single', 'Multiple'], default: 'Single' },

    // Fees
    govtFee: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    totalFee: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // Requirements
    documentsRequired: [{ type: String }], // e.g., ['Passport Front', 'Passport Back', 'Photo']
    description: { type: String }
});

const countrySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true }, // e.g., 'AE', 'TH'
    flag: { type: String }, // URL to flag image
    region: { type: String }, // e.g., 'Middle East', 'Asia'

    // Visa Information
    visaTypes: [visaTypeSchema],

    // General Info
    isActive: { type: Boolean, default: true },
    embassyAddress: String,
}, { timestamps: true });

const Country = mongoose.model('Country', countrySchema);
module.exports = Country;
