const express = require('express');
const router = express.Router();
const { addFunds, getWalletHistory, verifyDeposit, getAllTransactions } = require('../controllers/walletController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/add', protect, addFunds);
router.get('/history', protect, getWalletHistory);
router.get('/requests', protect, admin, getAllTransactions);
router.patch('/:id/verify', protect, admin, verifyDeposit);
router.get('/history', protect, getWalletHistory);

module.exports = router;
