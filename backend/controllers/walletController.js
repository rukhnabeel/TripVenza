const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Request Funds (Manual UPI Deposit)
// @route   POST /api/wallet/add
// @access  Private
exports.addFunds = async (req, res) => {
    try {
        const { amount, utrNumber } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        if (!utrNumber) {
            return res.status(400).json({ message: 'UTR Number is required for verification' });
        }

        // Check if UTR already exists to prevent duplicate requests
        const existingTxn = await Transaction.findOne({ utrNumber });
        if (existingTxn) {
            return res.status(400).json({ message: 'UTR Number already used' });
        }

        // Create Pending Transaction
        await Transaction.create({
            user: userId,
            amount: amount,
            type: 'Credit',
            category: 'Deposit',
            description: 'Wallet Top-up Request (UPI)',
            status: 'Pending',
            utrNumber: utrNumber,
            paymentMethod: 'UPI',
            balanceAfter: req.user.walletBalance // Current balance, not updated yet
        });

        res.json({
            success: true,
            message: 'Deposit request submitted. Admin will verify shortly.'
        });

    } catch (error) {
        console.error('Add Funds Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Deposit (Admin)
// @route   PATCH /api/wallet/:id/verify
// @access  Private/Admin
exports.verifyDeposit = async (req, res) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
        const { status, remarks } = req.body; // status: 'Approved' or 'Rejected'
        const transactionId = req.params.id;

        const transaction = await Transaction.findById(transactionId).session(session);

        if (!transaction) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'Pending') {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Transaction already processed' });
        }

        const statusNormalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        if (statusNormalized === 'Approved') {
            const user = await User.findById(transaction.user).session(session);
            user.walletBalance += transaction.amount;
            await user.save({ session });

            transaction.status = 'Success';
            transaction.balanceAfter = user.walletBalance; // Update snapshot
            transaction.description += ' (Verified)';
        } else if (statusNormalized === 'Rejected') {
            transaction.status = 'Rejected';
            transaction.description += ` (Rejected: ${remarks || 'Invalid UTR'})`;
        } else {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid status' });
        }

        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({ success: true, transaction });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Verify Deposit Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all wallet requests (Admin)
// @route   GET /api/wallet/requests
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
    try {
        const { status, search, startDate, endDate, type } = req.query;

        let query = {};

        // Filter by Status
        if (status && status !== 'All') {
            query.status = status;
        }

        // Filter by Type (default to 'Credit'/'Deposit' if usually just looking for deposits, but optional)
        if (type) {
            query.type = type;
        }

        // Filter by Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Search (UTR or User Name/Email)
        // Since user info is in a separate collection, we might need to find users first if searching by name
        if (search) {
            const searchRegex = new RegExp(search, 'i');

            // Find users matching name or email
            const users = await User.find({
                $or: [{ name: searchRegex }, { email: searchRegex }, { agencyName: searchRegex }]
            }).select('_id');
            const userIds = users.map(u => u._id);

            query.$or = [
                { utrNumber: searchRegex },
                { user: { $in: userIds } }
            ];
        }

        const history = await Transaction.find(query)
            .populate('user', 'name agencyName email')
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
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
