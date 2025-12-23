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
    status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Success' },
    referenceId: String, // Payment Gateway ID or Application ID
    balanceAfter: Number // Snapshot of balance after transaction
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
