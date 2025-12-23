const Application = require('../models/Application');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Country = require('../models/Country');

// @desc    Submit new visa application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const { countryId, visaType, applicants, totalInfos } = req.body;
        const userId = req.user._id;

        // 1. Validate Country & Fee
        const country = await Country.findById(countryId);
        if (!country) throw new Error('Invalid Country selected');

        const selectedVisa = country.visaTypes.find(v => v.type === visaType);
        if (!selectedVisa) throw new Error('Invalid Visa Type');

        const totalAmount = selectedVisa.totalFee * applicants.length;

        // 2. Check Wallet Balance
        const user = await User.findById(userId).session(session);
        if (user.walletBalance < totalAmount) {
            throw new Error(`Insufficient Wallet Balance. Required: ₹${totalAmount}, Available: ₹${user.walletBalance}`);
        }

        // 3. Deduct Balance
        user.walletBalance -= totalAmount;
        await user.save({ session });

        // 4. Create Transaction Record
        await Transaction.create([{
            user: userId,
            amount: totalAmount,
            type: 'Debit',
            category: 'Visa Fee',
            description: `Visa Application for ${country.name} (${applicants.length} applicants)`,
            balanceAfter: user.walletBalance
        }], { session });

        // 5. Create Application
        const application = await Application.create([{
            agent: userId,
            country: countryId,
            visaType: visaType,
            applicants: applicants,
            totalAmount: totalAmount,
            paymentStatus: 'Paid'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Application Submitted Successfully',
            applicationId: application[0].applicationId,
            remainingBalance: user.walletBalance
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get agent's applications
// @route   GET /api/applications
// @access  Private
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ agent: req.user._id })
            .populate('country', 'name flag')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
