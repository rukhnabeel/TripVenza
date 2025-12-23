const express = require('express');
const router = express.Router();
const { addFunds, getWalletHistory } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addFunds);
router.get('/history', protect, getWalletHistory);

module.exports = router;
