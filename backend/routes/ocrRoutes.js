const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/ocr/passport
// @desc    Process single passport image and extract data
// @access  Private
router.post('/passport', upload.single('passport'), ocrController.processPassport);

// @route   POST /api/ocr/extract
// @desc    Extract text from any document image
// @access  Private
router.post('/extract', upload.single('document'), ocrController.extractText);

// @route   POST /api/ocr/batch-passport
// @desc    Process multiple passport images at once
// @access  Private
router.post('/batch-passport', upload.array('passports', 10), ocrController.batchProcessPassport);

// @route   POST /api/ocr/upload
// @desc    Upload a file strictly for storage (Passport Back, Photo, etc.)
// @access  Private
router.post('/upload', upload.single('file'), ocrController.uploadFile);

// @route   POST /api/ocr/validate-face
// @desc    Upload and validate human face
// @access  Private
router.post('/validate-face', upload.single('file'), ocrController.validateFace);

// @route   POST /api/ocr/verify
// @desc    Verify extracted data against manual input
// @access  Private
router.post('/verify', ocrController.verifyExtractedData);

module.exports = router;
