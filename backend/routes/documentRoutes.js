const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    uploadFields,
    uploadDocuments,
    getDocuments,
    verifyDocument,
    updateKYCStatus
} = require('../controllers/documentController');

// @route   POST /api/documents/upload
// @desc    Upload agency documents
// @access  Private
router.post('/upload', protect, uploadFields, uploadDocuments);

// @route   GET /api/documents
// @desc    Get user documents and KYC status
// @access  Private
router.get('/', protect, getDocuments);

// @route   PUT /api/documents/verify/:userId/:documentType
// @desc    Verify a specific document (Admin only)
// @access  Private/Admin
router.put('/verify/:userId/:documentType', protect, admin, verifyDocument);

// @route   PUT /api/documents/kyc-status/:userId
// @desc    Update overall KYC status (Admin only)
// @access  Private/Admin
router.put('/kyc-status/:userId', protect, admin, updateKYCStatus);

module.exports = router;
