const ocrService = require('../utils/ocrService');
const advancedOCRService = require('../utils/advancedOCRService');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * @desc    Process passport image and extract data using OCR
 * @route   POST /api/ocr/passport
 * @access  Private
 */
exports.processPassport = async (req, res) => {
    try {
        console.log('🛂 Process Passport Request Received');
        if (req.file) console.log('📂 Uploaded File:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a passport image'
            });
        }

        // Check if advanced mode is requested
        const useAdvanced = req.query.advanced !== 'false'; // Default to true
        const documentType = req.body.type || 'front'; // 'front' or 'back'

        // Read the uploaded file (Local or Cloudinary URL)
        // Read the uploaded file (Local or Cloudinary URL)
        let imageBuffer;
        if (req.file.path.startsWith('http') || req.file.path.startsWith('https')) {
            // Cloudinary or other remote URL
            const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
        } else {
            // Local file
            imageBuffer = await fs.readFile(req.file.path);
        }

        let result;

        if (documentType === 'back') {
            // Process Back Page
            result = await advancedOCRService.processPassportBack(imageBuffer);
        } else {
            // Process Front Page (Default)
            result = useAdvanced
                ? await advancedOCRService.processPassportAdvanced(imageBuffer)
                : await ocrService.processPassport(imageBuffer);
        }

        // Keep uploaded file for reference (or delete validation fails)

        // STRICT VALIDATION: If Front Page and MRZ missing, reject immediately
        if (documentType !== 'back' && !result.mrzParsed) {
            console.warn('❌ Rejected Passport Front: No MRZ found');
            // Delete invalid file
            await fs.unlink(req.file.path).catch(console.error);

            return res.status(400).json({
                success: false,
                message: 'Invalid Document: Unable to read MRZ code. Please upload a clear Passport Front data page.'
            });
        }

        if (result.success) {
            console.log('✅ Final Extracted Data Sending to Frontend:', JSON.stringify(result.data, null, 2));
            res.json({
                success: true,
                data: result.data,
                confidence: result.confidence,
                faceImage: result.faceImage,
                documentType: result.documentType || 'passport',
                mrzParsed: result.mrzParsed || false,
                dataCompleteness: result.dataCompleteness || 0,
                message: result.message,
                filePath: `uploads/${req.file.filename}`,
                advanced: useAdvanced
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('OCR processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process passport image',
            error: error.message
        });
    }
};

/**
 * @desc    Extract text from any document image
 * @route   POST /api/ocr/extract
 * @access  Private
 */
exports.extractText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Read the uploaded file
        const imageBuffer = await fs.readFile(req.file.path);

        // Extract text using OCR
        const result = await ocrService.extractText(imageBuffer);

        res.json({
            success: true,
            text: result.text,
            confidence: result.confidence,
            message: 'Text extracted successfully'
        });

    } catch (error) {
        console.error('Text extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to extract text from image',
            error: error.message
        });
    }
};

/**
 * @desc    Process multiple passport documents at once
 * @route   POST /api/ocr/batch-passport
 * @access  Private
 */
exports.batchProcessPassport = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one passport image'
            });
        }

        const results = [];

        // Process each uploaded file
        for (const file of req.files) {
            try {
                const imageBuffer = await fs.readFile(file.path);
                const result = await ocrService.processPassport(imageBuffer);

                results.push({
                    filename: file.originalname,
                    ...result
                });
            } catch (error) {
                results.push({
                    filename: file.originalname,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            results: results,
            message: `Processed ${results.length} passport images`
        });

    } catch (error) {
        console.error('Batch processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process passport images',
            error: error.message
        });
    }
};

/**
 * @desc    Verify extracted data against manual input
 * @route   POST /api/ocr/verify
 * @access  Private
 */
exports.verifyExtractedData = async (req, res) => {
    try {
        const { extractedData, manualData } = req.body;

        if (!extractedData || !manualData) {
            return res.status(400).json({
                success: false,
                message: 'Both extracted and manual data are required'
            });
        }

        // Compare fields and calculate accuracy
        const fields = ['passportNumber', 'firstName', 'lastName', 'dateOfBirth', 'passportExpiry', 'nationality', 'gender'];
        const comparison = {};
        let matchCount = 0;

        fields.forEach(field => {
            const extracted = extractedData[field]?.toString().toLowerCase().trim();
            const manual = manualData[field]?.toString().toLowerCase().trim();
            const matches = extracted === manual;

            comparison[field] = {
                extracted: extractedData[field],
                manual: manualData[field],
                matches: matches
            };

            if (matches && extracted) matchCount++;
        });

        const accuracy = (matchCount / fields.length) * 100;

        res.json({
            success: true,
            comparison: comparison,
            accuracy: accuracy.toFixed(2),
            message: `OCR accuracy: ${accuracy.toFixed(2)}%`
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify data',
            error: error.message
        });
    }
};

/**
 * @desc    Upload a file strictly for storage (Passport Back, Photo, etc.)
 * @route   POST /api/ocr/upload
 * @access  Private
 */
exports.uploadFile = (req, res) => {
    try {
        console.log('📂 Upload File Request Received');
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Return the path relative to the server root (just uploads/filename)
        // Fix Windows paths to forward slashes for URL consistency
        const filePath = `uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            filePath: filePath,
            filename: req.file.filename
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file'
        });
    }
};

/**
 * @desc    Validate if an image contains a human face
 * @route   POST /api/ocr/validate-face
 * @access  Private
 */
exports.validateFace = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Read image (Local or Cloudinary)
        let filePath = req.file.path;
        if (req.file.secure_url) filePath = req.file.secure_url;
        else if (req.file.url) filePath = req.file.url;

        let imageBuffer;
        if (filePath && (filePath.startsWith('http') || filePath.startsWith('https'))) {
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
        } else {
            imageBuffer = await fs.readFile(req.file.path);
        }
        const result = await advancedOCRService.detectFace(imageBuffer);

        if (!result.hasFace) {
            // Remove the invalid file to save space
            await fs.unlink(req.file.path).catch(console.error);

            return res.status(400).json({
                success: false,
                message: 'No human face detected. Please upload a clear photo of the applicant.',
                confidence: result.confidence
            });
        }

        // Face detected - Return success and file path (same as uploadFile)
        const relativeFilePath = `uploads/${req.file.filename}`;

        res.json({
            success: true,
            hasFace: true,
            faceCount: result.faceCount,
            confidence: result.confidence,
            filePath: relativeFilePath,
            filename: req.file.filename,
            message: 'Face detected successfully'
        });

    } catch (error) {
        console.error('Face validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate face',
            error: error.message
        });
    }
};
