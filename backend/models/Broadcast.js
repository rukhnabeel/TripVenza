const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // HTML or Text
    type: { type: String, enum: ['Banner', 'Alert', 'Email'], default: 'Banner' }, // Banner shows on Dashboard

    targetAudience: { type: String, enum: ['All', 'Silver', 'Gold', 'Platinum'], default: 'All' },

    isActive: { type: Boolean, default: true },
    expiresAt: Date,

    ctaLink: String, // "Click here to Apply Now"
    ctaText: String
}, { timestamps: true });

const Broadcast = mongoose.model('Broadcast', broadcastSchema);
module.exports = Broadcast;
