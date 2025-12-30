const User = require('../models/User');

// @desc    Get all agents
// @route   GET /api/users/agents
// @access  Private/Admin
exports.getAllAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).select('-password').sort({ createdAt: -1 });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update agent status (Approve/Reject/Block)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateAgentStatus = async (req, res) => {
    try {
        const { status, action } = req.body; // action can be 'approve', 'reject', 'block', 'unblock'
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { sendEmail } = require('../utils/emailService');

        if (action === 'approve') {
            user.kycStatus = 'Approved';
            user.kycApprovedAt = Date.now();

            // Send Approval Email
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #059669;">Account Approved!</h2>
                    <p>Dear ${user.name},</p>
                    <p>Congratulations! Your Agency <strong>${user.agencyName}</strong> has been verified and approved.</p>
                    <p>You can now login to your dashboard and start submitting visa applications.</p>
                    <a href="http://localhost:5173/login" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Dashboard</a>
                </div>
            `;
            await sendEmail(user.email, 'Account Approved - TripVenza', emailHtml);

        } else if (action === 'reject') {
            user.kycStatus = 'Rejected';
            user.kycRejectionReason = req.body.reason || 'Documents INVALID';

            // Send Rejection Email
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #DC2626;">Verification Failed</h2>
                    <p>Dear ${user.name},</p>
                    <p>We regret to inform you that your account verification for <strong>${user.agencyName}</strong> has been rejected.</p>
                    <p><strong>Reason:</strong> ${user.kycRejectionReason}</p>
                    <p>Please update your documents and resubmit.</p>
                </div>
            `;
            await sendEmail(user.email, 'Account Verification Rejected - TripVenza', emailHtml);

        } else if (action === 'block') {
            user.isActive = false;
        } else if (action === 'unblock') {
            user.isActive = true;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update agent tier (Silver/Gold/Platinum)
// @route   PATCH /api/users/:id/tier
// @access  Private/Admin
exports.updateAgentTier = async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['Silver', 'Gold', 'Platinum'].includes(tier)) {
            return res.status(400).json({ message: 'Invalid tier. Must be Silver, Gold, or Platinum' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.tier = tier;
        const updatedUser = await user.save();
        res.json({ message: 'Agent tier updated', tier: updatedUser.tier, _id: updatedUser._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current agent's sub-agents
// @route   GET /api/users/sub-agents
// @access  Private (Agent)
exports.getMySubAgents = async (req, res) => {
    try {
        const subAgents = await User.find({ parentAgentId: req.user._id }).select('-password').sort({ createdAt: -1 });
        res.json(subAgents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new sub-agent
// @route   POST /api/users/sub-agents
// @access  Private (Agent)
exports.createSubAgent = async (req, res) => {
    try {
        const { name, email, phone, password, permissions } = req.body;
        const parentAgent = await User.findById(req.user._id);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password (if not handled by pre-save hook properly in some versions, doing it explicitly is safer here as per AuthController pattern)
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const subAgent = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'sub-agent',
            parentAgentId: req.user._id,
            permissions: permissions || [],
            agencyName: parentAgent.agencyName, // Inherit Agency Name
            agencyType: parentAgent.agencyType,
            address: parentAgent.address, // Inherit Address by default
            panNumber: `SUB-${Date.now()}`, // Temporary placeholder
            kycStatus: 'Approved', // Auto-approve sub-agents of verified agents? Or require separate KYC? Assuming simplified for now.
            isActive: true
        });

        res.status(201).json({
            _id: subAgent._id,
            name: subAgent.name,
            email: subAgent.email,
            permissions: subAgent.permissions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update sub-agent (permissions/status)
// @route   PUT /api/users/sub-agents/:id
// @access  Private (Agent)
exports.updateSubAgent = async (req, res) => {
    try {
        const { permissions, isActive } = req.body;
        const subAgent = await User.findOne({ _id: req.params.id, parentAgentId: req.user._id });

        if (!subAgent) {
            return res.status(404).json({ message: 'Sub-agent not found' });
        }

        if (permissions) subAgent.permissions = permissions;
        if (typeof isActive === 'boolean') subAgent.isActive = isActive;

        await subAgent.save();
        res.json({ message: 'Sub-agent updated successfully', subAgent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update agent documents and profile
// @route   POST /api/users/profile/documents
// @access  Private
exports.updateAgentDocuments = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const {
            agencyName, agencyType, panNumber, gstNumber,
            address, businessRegistration, bankDetails
        } = req.body;

        // Update Text Fields
        if (agencyName) user.agencyName = agencyName;
        if (agencyType) user.agencyType = agencyType;
        if (panNumber) user.panNumber = panNumber;
        if (gstNumber) user.gstNumber = gstNumber;
        if (address) user.address = typeof address === 'string' ? JSON.parse(address) : address;

        if (businessRegistration) {
            const parsed = typeof businessRegistration === 'string' ? JSON.parse(businessRegistration) : businessRegistration;
            // Sanitize empty strings to prevent enum validation errors
            if (parsed.registrationType === '') delete parsed.registrationType;
            if (parsed.registrationDate === '') delete parsed.registrationDate;
            user.businessRegistration = parsed;
        }

        if (bankDetails) user.bankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;

        // Handle File Uploads
        if (req.files) {
            const currentDate = new Date();

            // Ensure documents object exists
            if (!user.documents) user.documents = {};

            // Map frontend field names to document keys
            const fileFields = [
                'panCard', 'gstCertificate', 'addressProof',
                'businessRegistrationCertificate', 'tradeLicense', 'iataLicense',
                'cancelledCheque', 'ownerPhoto', 'ownerPan', 'ownerAadhar'
            ];

            fileFields.forEach(field => {
                if (req.files[field]) {
                    user.documents[field] = {
                        url: `/uploads/${req.files[field][0].filename}`,
                        type: field === 'addressProof' ? (req.body.addressProofType || 'Electricity Bill') : undefined,
                        uploadedAt: currentDate,
                        verified: false
                    };
                }
            });

            // Special handling for addressProofType if only type changed but no new file
            if (req.body.addressProofType && user.documents.addressProof) {
                user.documents.addressProof.type = req.body.addressProofType;
            }
        }

        // Update Status
        user.kycStatus = 'Submitted';
        user.kycSubmittedAt = Date.now();
        user.kycRejectionReason = undefined; // Clear previous rejection reason

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            kycStatus: updatedUser.kycStatus,
            documents: updatedUser.documents
        });

    } catch (error) {
        console.error('Update Documents Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Name, Phone, etc.)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.agencyName = req.body.agencyName || user.agencyName;

        // Handle structured address update if provided
        if (req.body.address) {
            // If address is sent as a string (from simple text area), try to parse or just update street
            if (typeof req.body.address === 'string') {
                // For now, if string, just update street to keep it simple, or expect object
                // Ideally frontend sends object.
                try {
                    const parsed = JSON.parse(req.body.address);
                    user.address = { ...user.address, ...parsed };
                } catch (e) {
                    user.address.street = req.body.address; // Fallback
                }
            } else {
                user.address = { ...user.address, ...req.body.address };
            }
        }

        if (req.body.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            agencyName: updatedUser.agencyName,
            address: updatedUser.address,
            walletBalance: updatedUser.walletBalance,
            kycStatus: updatedUser.kycStatus,
            tier: updatedUser.tier
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/profile/password
// @access  Private
exports.changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user notification preferences
// @route   PUT /api/users/profile/notifications
// @access  Private
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.notifications = {
            ...user.notifications,
            ...req.body
        };

        const updatedUser = await user.save();

        res.json({
            success: true,
            notifications: updatedUser.notifications
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
};

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct file URL - Use FILE_BASE_URL logic if centralized, otherwise:
        // Assuming uploads are served statically from /uploads
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        user.avatar = fileUrl;
        await user.save();

        res.json({
            success: true,
            avatar: fileUrl,
            message: 'Avatar updated successfully'
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};
