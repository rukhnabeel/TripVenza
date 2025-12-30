const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    category: {
        type: String,
        enum: ['Deposit', 'Visa Fee', 'Refund', 'Adjustment'],
        required: true
    },
    description: String,
    status: { type: String, enum: ['Success', 'Pending', 'Failed', 'Rejected'], default: 'Pending' }, // Changed default to Pending
    referenceId: String, // Payment Gateway ID or Application ID
    utrNumber: String, // For UPI/Bank Transfer
    paymentMethod: { type: String, enum: ['UPI', 'Bank Transfer', 'Gateway', 'Admin Adjustment', 'Wallet', 'Card'], default: 'UPI' },
    proofUrl: String, // Optional screenshot
    balanceAfter: Number // Snapshot of balance after transaction
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
