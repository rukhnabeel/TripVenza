const express = require('express');
const router = express.Router();
const { createApplication, getMyApplications, getApplicationStats, trackApplicationStatus, updateApplicationStatus, getApplicationDetails } = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/stats', protect, getApplicationStats);
router.get('/track/:id', trackApplicationStatus); // Public route
router.post('/', protect, createApplication);
router.get('/', protect, getMyApplications);

// Admin Routes
router.put('/:id/status', protect, admin, upload.single('visaDocument'), updateApplicationStatus);
router.get('/:id', protect, getApplicationDetails);

module.exports = router;
