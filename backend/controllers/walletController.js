const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Add funds to wallet (Mock Payment)
// @route   POST /api/wallet/add
// @access  Private
exports.addFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(userId);
        user.walletBalance += Number(amount);
        await user.save();

        await Transaction.create({
            user: userId,
            amount: amount,
            type: 'Credit',
            category: 'Deposit',
            description: 'Wallet Top-up via PG',
            balanceAfter: user.walletBalance
        });

        res.json({
            success: true,
            newBalance: user.walletBalance,
            message: 'Funds added successfully'
        });

    } catch (error) {
        console.error('Add Funds Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get wallet history
// @route   GET /api/wallet/history
// @access  Private
exports.getWalletHistory = async (req, res) => {
    try {
        const history = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
