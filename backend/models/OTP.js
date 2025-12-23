const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    identifier: { type: String, required: true }, // Email or Phone number
    type: { type: String, enum: ['email', 'mobile'], required: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes
});

module.exports = mongoose.model('OTP', otpSchema);
