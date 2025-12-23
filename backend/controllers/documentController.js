const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/documents');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs only
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Upload fields configuration
const uploadFields = upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'businessRegistrationCertificate', maxCount: 1 },
    { name: 'ownerAadhar', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'ownerPan', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'iataLicense', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'directorAadhar', maxCount: 10 },
    { name: 'directorPan', maxCount: 10 },
    { name: 'directorPhoto', maxCount: 10 }
]);

// @desc    Upload agency documents
// @route   POST /api/documents/upload
// @access  Private
const uploadDocuments = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            agencyName,
            agencyType,
            panNumber,
            gstNumber,
            address,
            businessRegistration,
            bankDetails,
            addressProofType,
            directors
        } = req.body;

        // Validate mandatory fields
        if (!panNumber) {
            return res.status(400).json({ message: 'PAN Number is mandatory' });
        }

        // Parse address if it's a string
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;

        if (!parsedAddress || !parsedAddress.street || !parsedAddress.city ||
            !parsedAddress.state || !parsedAddress.zip) {
            return res.status(400).json({ message: 'Complete address is mandatory' });
        }

        // Check if PAN Card is uploaded
        if (!req.files || !req.files.panCard) {
            return res.status(400).json({ message: 'PAN Card document is mandatory' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic information
        user.agencyName = agencyName || user.agencyName;
        user.agencyType = agencyType || user.agencyType;
        user.panNumber = panNumber;
        user.gstNumber = gstNumber || user.gstNumber;
        user.address = parsedAddress;

        // Update business registration
        if (businessRegistration) {
            const parsedBR = typeof businessRegistration === 'string'
                ? JSON.parse(businessRegistration)
                : businessRegistration;
            user.businessRegistration = parsedBR;
        }

        // Update bank details
        if (bankDetails) {
            const parsedBD = typeof bankDetails === 'string'
                ? JSON.parse(bankDetails)
                : bankDetails;
            user.bankDetails = parsedBD;
        }

        // Process uploaded documents
        const currentDate = new Date();

        // Helper function to update document
        const updateDocument = (docType, fileArray) => {
            if (fileArray && fileArray.length > 0) {
                return {
                    url: `/uploads/documents/${fileArray[0].filename}`,
                    verified: false,
                    uploadedAt: currentDate
                };
            }
            return user.documents[docType];
        };

        // Update all document types
        user.documents.panCard = updateDocument('panCard', req.files.panCard);
        user.documents.gstCertificate = updateDocument('gstCertificate', req.files.gstCertificate);
        user.documents.businessRegistrationCertificate = updateDocument('businessRegistrationCertificate', req.files.businessRegistrationCertificate);
        user.documents.ownerAadhar = updateDocument('ownerAadhar', req.files.ownerAadhar);
        user.documents.ownerPhoto = updateDocument('ownerPhoto', req.files.ownerPhoto);
        user.documents.ownerPan = updateDocument('ownerPan', req.files.ownerPan);
        user.documents.tradeLicense = updateDocument('tradeLicense', req.files.tradeLicense);
        user.documents.iataLicense = updateDocument('iataLicense', req.files.iataLicense);
        user.documents.cancelledCheque = updateDocument('cancelledCheque', req.files.cancelledCheque);

        // Update address proof with type
        if (req.files.addressProof && req.files.addressProof.length > 0) {
            user.documents.addressProof = {
                url: `/uploads/documents/${req.files.addressProof[0].filename}`,
                type: addressProofType || 'Electricity Bill',
                verified: false,
                uploadedAt: currentDate
            };
        }

        // Update KYC status
        user.kycStatus = 'Submitted';
        user.kycSubmittedAt = currentDate;

        await user.save();

        res.status(200).json({
            message: 'Documents uploaded successfully',
            kycStatus: user.kycStatus,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                agencyName: user.agencyName,
                kycStatus: user.kycStatus
            }
        });

    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({
            message: 'Error uploading documents',
            error: error.message
        });
    }
};

// @desc    Get user documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password -otp');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            agencyName: user.agencyName,
            agencyType: user.agencyType,
            panNumber: user.panNumber,
            gstNumber: user.gstNumber,
            address: user.address,
            businessRegistration: user.businessRegistration,
            bankDetails: user.bankDetails,
            documents: user.documents,
            kycStatus: user.kycStatus,
            kycSubmittedAt: user.kycSubmittedAt,
            kycApprovedAt: user.kycApprovedAt,
            kycRejectionReason: user.kycRejectionReason
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
};

// @desc    Verify document (Admin only)
// @route   PUT /api/documents/verify/:userId/:documentType
// @access  Private/Admin
const verifyDocument = async (req, res) => {
    try {
        const { userId, documentType } = req.params;
        const { verified, rejectionReason } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update document verification status
        if (user.documents[documentType]) {
            user.documents[documentType].verified = verified;
            if (verified) {
                user.documents[documentType].verifiedAt = new Date();
            }
        }

        // Check if all mandatory documents are verified
        const mandatoryDocs = ['panCard'];
        const allVerified = mandatoryDocs.every(doc =>
            user.documents[doc] && user.documents[doc].verified
        );

        if (allVerified && verified) {
            user.kycStatus = 'Approved';
            user.kycApprovedAt = new Date();
            user.isVerified = true;
        } else if (!verified) {
            user.kycStatus = 'Rejected';
            user.kycRejectionReason = rejectionReason || 'Document verification failed';
        }

        await user.save();

        res.status(200).json({
            message: 'Document verification updated',
            kycStatus: user.kycStatus
        });

    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({
            message: 'Error verifying document',
            error: error.message
        });
    }
};

// @desc    Update KYC status (Admin only)
// @route   PUT /api/documents/kyc-status/:userId
// @access  Private/Admin
const updateKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, rejectionReason } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.kycStatus = status;

        if (status === 'Approved') {
            user.kycApprovedAt = new Date();
            user.isVerified = true;
            user.kycRejectionReason = null;
        } else if (status === 'Rejected') {
            user.kycRejectionReason = rejectionReason;
            user.isVerified = false;
        }

        await user.save();

        res.status(200).json({
            message: 'KYC status updated successfully',
            kycStatus: user.kycStatus,
            isVerified: user.isVerified
        });

    } catch (error) {
        console.error('Error updating KYC status:', error);
        res.status(500).json({
            message: 'Error updating KYC status',
            error: error.message
        });
    }
};

module.exports = {
    uploadFields,
    uploadDocuments,
    getDocuments,
    verifyDocument,
    updateKYCStatus
};
