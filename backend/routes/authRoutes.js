const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Configure upload fields for registration
const registerUploads = upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
]);

// Controller imports
// Controller imports
const { registerUser, loginUser, sendOtp, verifyOtp, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUploads, registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
