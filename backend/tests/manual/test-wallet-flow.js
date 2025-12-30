const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const testWalletFlow = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('ERROR: MONGO_URI is missing');
            process.exit(1);
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);

        // 1. Setup User
        let user = await User.findOne({ email: 'test_wallet_agent@tripvenza.com' });
        if (!user) {
            user = await User.create({
                name: 'Wallet Test Agent',
                email: 'test_wallet_agent@tripvenza.com',
                phone: '9988776655',
                password: 'password123',
                role: 'agent',
                panNumber: 'WPAN12345',
                address: { street: 'Test', city: 'Test', state: 'Test', zip: '000000', country: 'India' }
            });
            console.log('Created test user');
        } else {
            // Reset balance
            user.walletBalance = 0;
            await user.save();
            console.log('Reset test user balance to 0');
        }

        const initialBalance = user.walletBalance;

        // 2. Request Funds (Simulate addFunds controller logic)
        const amount = 5000;
        const utrNumber = `UTR-${Date.now()}`;

        console.log(`Requesting ₹${amount} with UTR: ${utrNumber}`);

        const transaction = await Transaction.create({
            user: user._id,
            amount: amount,
            type: 'Credit',
            category: 'Deposit',
            description: 'Wallet Top-up Request',
            status: 'Pending',
            utrNumber: utrNumber,
            paymentMethod: 'UPI',
            balanceAfter: initialBalance
        });

        console.log('Transaction Created:', transaction._id);

        // 3. Admin Verify (Simulate verifyDeposit controller logic)
        console.log('Simulating Admin Approval...');

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const txnToVerify = await Transaction.findById(transaction._id).session(session);

            // Simulating Logic
            const userToUpdate = await User.findById(txnToVerify.user).session(session);
            userToUpdate.walletBalance += txnToVerify.amount;
            await userToUpdate.save({ session });

            txnToVerify.status = 'Success'; // Note: Schema uses 'Success'
            txnToVerify.balanceAfter = userToUpdate.walletBalance;
            await txnToVerify.save({ session });

            await session.commitTransaction();
            console.log('Transaction Approved.');
        } catch (err) {
            await session.abortTransaction();
            console.error('Transaction failed during approval:', err.message);
            // Fallback for non-replica set
            if (err.message.includes('Transactions are not supported')) {
                console.warn('⚠️ Transactions not supported (Standalone Mongo?). Running without transaction.');
                const txnToVerify = await Transaction.findById(transaction._id);
                const userToUpdate = await User.findById(txnToVerify.user);
                userToUpdate.walletBalance += txnToVerify.amount;
                await userToUpdate.save();
                txnToVerify.status = 'Success';
                txnToVerify.balanceAfter = userToUpdate.walletBalance;
                await txnToVerify.save();
                console.log('Transaction Approved (Fallback Mode).');
            } else {
                throw err;
            }
        } finally {
            session.endSession();
        }

        // 4. Verify Result
        const updatedUser = await User.findById(user._id);
        console.log(`Final Balance: ₹${updatedUser.walletBalance}`);

        if (updatedUser.walletBalance === initialBalance + amount) {
            console.log('✅ TEST PASSED: Balance updated correctly.');
        } else {
            console.log('❌ TEST FAILED: Balance mismatch.');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('Test Error:', error);
        await mongoose.disconnect();
    }
};

testWalletFlow();
