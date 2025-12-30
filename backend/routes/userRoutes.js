const express = require('express');
const router = express.Router();
const { getAllAgents, updateAgentStatus, updateAgentDocuments, getMySubAgents, createSubAgent, updateSubAgent, updateUserProfile, changeUserPassword, updateNotificationPreferences, uploadAvatar, updateAgentTier } = require('../controllers/userController');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/agents', protect, admin, getAllAgents);
router.patch('/:id/status', protect, admin, updateAgentStatus);
router.patch('/:id/tier', protect, admin, updateAgentTier);

// Sub-Agent Routes
router.get('/sub-agents', protect, getMySubAgents);
router.post('/sub-agents', protect, createSubAgent);
router.put('/sub-agents/:id', protect, updateSubAgent);

// Configure upload fields for profile update
const updateUploads = upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'businessRegistrationCertificate', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'iataLicense', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'ownerPan', maxCount: 1 },
    { name: 'ownerAadhar', maxCount: 1 }
]);

router.post('/profile/documents', protect, updateUploads, updateAgentDocuments);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/password', protect, changeUserPassword);
router.put('/profile/notifications', protect, updateNotificationPreferences);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
