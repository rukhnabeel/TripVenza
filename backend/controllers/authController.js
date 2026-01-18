const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendEmail } = require('../utils/emailService');
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

        if (req.files['ownerPhoto']) {
            documents.ownerPhoto = {
                url: `/uploads/${req.files['ownerPhoto'][0].filename}`,
                uploadedAt: currentDate,
                verified: false
            };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
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
            kycSubmittedAt: currentDate,
            tier: 'Silver',
            currency: 'INR'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
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
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
            }
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    agencyName: user.agencyName, // Added for dynamic routing
                    kycStatus: user.kycStatus,
                    walletBalance: user.walletBalance,
                    tier: user.tier,
                    currency: user.currency
                },
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
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

        if (type === 'email') {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">TripVenza Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">
                        ${otpCode}
                    </div>
                    <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">This code is valid for 5 minutes.</p>
                </div>
            `;

            const emailSent = await sendEmail(identifier, 'Your Verification Code - TripVenza', emailHtml);

            if (!emailSent) {
                // If email fails (and no mock fallback in dev), we might want to error out or log it
                console.warn('Email sending failed, but OTP generated for dev purposes.');
            }
            console.log(`[OTP] Email OTP for ${identifier}: ${otpCode}`); // Keep log for dev backup
        } else {
            // Mobile OTP (Mock for now)
            console.log(`[OTP] Mobile OTP for ${identifier}: ${otpCode}`);
        }

        // Return OTP in response for dev/mobile mock
        res.json({
            message: 'OTP sent successfully',
            // TODO: Remove this in production!
            devOtp: otpCode
        });
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

// @desc    Emergency Admin Reset
// @route   GET /api/auth/reset-admin-force
exports.emergencyResetAdmin = async (req, res) => {
    const bcrypt = require('bcryptjs'); // Ensure bcrypt is available
    try {
        const email = 'admin@tripvenza.com';
        const password = 'admin123';

        await User.deleteOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Super Admin',
            email,
            phone: '9999999999',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            kycStatus: 'Approved',
            tier: 'Platinum',
            address: { street: 'Admin HQ', city: 'Delhi', state: 'Delhi', zip: '110001', country: 'India' },
            panNumber: 'ADMIN1234X'
        });

        console.log('--- EMERGENCY ADMIN RESET SUCCESSFUL ---');
        res.json({ message: 'Admin reset successful. Login with admin@tripvenza.com / admin123' });
    } catch (error) {
        console.error('Emergency Reset Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with type 'password_reset'
        await OTP.findOneAndUpdate(
            { identifier: email, type: 'password_reset' },
            { otp: otpCode, verified: false, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #DC2626;">Reset Your Password</h2>
                <p>You requested a password reset for your TripVenza account.</p>
                <p>Your password reset code is:</p>
                <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #DC2626; border: 1px solid #FECACA;">
                    ${otpCode}
                </div>
                <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">This code is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
            </div>
        `;

        const emailSent = await sendEmail(email, 'Reset Password - TripVenza', emailHtml);

        // Log for dev/test even if email fails (mock mode)
        console.log(`🔐 [RESET OTP] Code for ${email}: ${otpCode}`);

        res.json({ message: 'Password reset OTP sent to email' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password - Verify OTP and Update Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ identifier: email, type: 'password_reset' });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired reset request' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        // Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Delete OTP record after successful reset to prevent reuse
        await OTP.deleteOne({ _id: otpRecord._id });

        // Send Confirmation Email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Password Changed</h2>
                <p>Your TripVenza account password has been successfully reset.</p>
                <p>If you did not perform this action, please contact support immediately.</p>
            </div>
        `;
        await sendEmail(email, 'Password Changed Successfully - TripVenza', emailHtml);

        res.json({ message: 'Password reset successful. Please login with new password.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: error.message });
    }
}
};

// @desc    Test SMTP Connection (Debug)
// @route   GET /api/auth/test-smtp
// @access  Public
exports.testSmtp = async (req, res) => {
    try {
        const nodemailer = require('nodemailer');

        const config = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS // Passwords are hidden in logs usually
            },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000
        };

        const transporter = nodemailer.createTransport(config);

        console.log('Testing SMTP from Server:', { ...config, auth: { ...config.auth, pass: '*****' } });

        await transporter.verify();

        res.json({
            success: true,
            message: '✅ SMTP Connection Successful! Hostinger/Titan is reachable.',
            config: { ...config, auth: { user: config.auth.user, pass: '******' } }
        });

    } catch (error) {
        console.error('SMTP Test Failed:', error);
        res.status(500).json({
            success: false,
            message: '❌ SMTP Connection Failed',
            error: error.message,
            code: error.code,
            details: 'This confirms the server (Render) cannot reach the Email Provider (Hostinger).',
            config: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
                secure: process.env.SMTP_PORT == 465
            }
        });
    }
};
