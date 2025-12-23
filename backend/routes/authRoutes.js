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
const { registerUser, loginUser, sendOtp, verifyOtp } = require('../controllers/authController');

router.post('/register', registerUploads, registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
