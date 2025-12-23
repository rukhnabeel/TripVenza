const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new agent
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const {
            name, email, phone, password,
            agencyName, agencyType,
            gstNumber, panNumber,
            address, businessRegistration, bankDetails,
            addressProofType
        } = req.body;

        // Validation for mandatory files
        if (!req.files || !req.files['panCard']) {
            return res.status(400).json({ message: 'PAN Card document is mandatory' });
        }
        if (!req.files || !req.files['aadhaarCard']) {
            return res.status(400).json({ message: 'Aadhaar Card (with QR code) is mandatory' });
        }
        if (!req.files || !req.files['addressProof']) {
            return res.status(400).json({ message: 'Address Proof document is mandatory' });
        }
        if (!panNumber) {
            return res.status(400).json({ message: 'PAN Number is mandatory' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Parse JSON fields if they come as strings
        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;

        // Prepare document objects
        const currentDate = new Date();
        const documents = {
            panCard: {
                url: `/uploads/${req.files['panCard'][0].filename}`,
                uploadedAt: currentDate,
                verified: false
            },
            ownerAadhar: {
                url: `/uploads/${req.files['aadhaarCard'][0].filename}`,
                uploadedAt: currentDate,
                verified: false
            },
            addressProof: {
                url: `/uploads/${req.files['addressProof'][0].filename}`,
                type: addressProofType || 'Electricity Bill',
                uploadedAt: currentDate,
                verified: false
            }
        };

        if (req.files['gstCertificate']) {
            documents.gstCertificate = {
                url: `/uploads/${req.files['gstCertificate'][0].filename}`,
                uploadedAt: currentDate,
                verified: false
            };
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            agencyName,
            agencyType,
            gstNumber,
            panNumber,
            address: parsedAddress,
            businessRegistration: typeof businessRegistration === 'string' ? JSON.parse(businessRegistration) : businessRegistration,
            bankDetails: typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails,
            documents,
            walletBalance: 0,
            kycStatus: 'Submitted',
            kycSubmittedAt: currentDate
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance
                },
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
    try {
        const { identifier, type } = req.body;
        if (!identifier || !type) {
            return res.status(400).json({ message: 'Identifier and type are required' });
        }

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (upsert - create new or update existing)
        await OTP.findOneAndUpdate(
            { identifier, type },
            { otp: otpCode, verified: false, createdAt: Date.now() }, // Reset verified on new OTP
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // MOCK SENDING - Log to console
        console.log(`[MOCK OTP] Sending ${type} OTP to ${identifier}: ${otpCode}`);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    try {
        const { identifier, type, otp } = req.body;

        const otpRecord = await OTP.findOne({ identifier, type });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or not found. Please resend.' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code.' });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        res.json({ message: 'Verification successful', verified: true });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};
