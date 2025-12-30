const Application = require('../models/Application');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Country = require('../models/Country');

// @desc    Submit new visa application
// @route   POST /api/applications
// @access  Private
// @desc    Submit new visa application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const { countryId, visaType, applicants, isGroupApplication, groupName, paymentMethod = 'Wallet' } = req.body;
        const userId = req.user._id;

        // 1. Validate Country & Fee
        const country = await Country.findById(countryId);
        if (!country) throw new Error('Invalid Country selected');

        const selectedVisa = country.visaTypes.find(v => v.type === visaType);
        if (!selectedVisa) throw new Error('Invalid Visa Type');

        // Feature: Dynamic Pricing based on Tier
        const user = await User.findById(userId).session(session);
        const userTier = user.tier ? user.tier.toLowerCase() : 'silver';

        const govtFee = selectedVisa.govtFee;
        const serviceFee = selectedVisa.tieredServiceFees?.[userTier] || selectedVisa.baseServiceFee;
        const taxAmount = 0; // standard tax logic if needed
        const perApplicantTotal = govtFee + serviceFee + taxAmount;

        const totalAmount = perApplicantTotal * applicants.length;

        // 2. Handle Payment Logic based on Method
        let paymentStatus = 'Pending';
        let transactionId = null;

        if (paymentMethod === 'Wallet') {
            // Check Wallet Balance
            if (user.walletBalance < totalAmount) {
                throw new Error(`Insufficient Wallet Balance. Required: ₹${totalAmount}, Available: ₹${user.walletBalance}`);
            }

            // Deduct Balance
            user.walletBalance -= totalAmount;
            user.performanceMetrics.totalFilesProcessed += applicants.length;
            user.performanceMetrics.totalSpentLastMonth += totalAmount;
            await user.save({ session });

            // Create Transaction Record
            const groupRef = isGroupApplication ? `GRP-${Date.now()}` : null;
            const txn = await Transaction.create([{
                user: userId,
                amount: totalAmount,
                type: 'Debit',
                category: 'Visa Fee',
                description: `Visa Application for ${country.name} (${applicants.length} applicants)${isGroupApplication ? ` - Group: ${groupName}` : ''}`,
                balanceAfter: user.walletBalance,
                referenceId: groupRef,
                paymentMethod: 'Wallet'
            }], { session });

            paymentStatus = 'Paid'; // Wallet means immediate success
            transactionId = txn[0]._id;
        } else {
            // Logic for UPI / Card (Assuming gateway success for now)
            // Ideally, we would have a 'verifyPayment' endpoint, but for this task,
            // we'll assume the frontend only calls this after successful gateway interaction (mocked)
            // or checks a reference ID.
            paymentStatus = 'Paid'; // Mocking success for UPI/Card
        }

        // 3. Create Application
        // Map applicants to schema structure
        const processedApplicants = applicants.map(app => ({
            ...app,
            status: 'Submitted'
        }));

        const groupRef = isGroupApplication ? `GRP-${Date.now()}` : null;

        const application = await Application.create([{
            agent: userId,
            country: countryId,
            visaType: visaType,
            applicants: processedApplicants,

            // Group Fields
            isGroupApplication: !!isGroupApplication,
            groupName: groupName || null,
            groupReferenceId: groupRef,

            // Pricing Snapshot
            pricingSnapshot: {
                govtFee,
                serviceFee,
                taxAmount,
                totalAmount: totalAmount,
                currency: 'INR'
            },

            totalAmount: totalAmount,
            paymentStatus: paymentStatus, // Paid or Pending
            status: 'Submitted',
            paymentMethod: paymentMethod
        }], { session });

        // 4. Send Email Notification to Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@tripvenza.com';
        const adminDashboardLink = `http://localhost:5173/admin/dashboard/applications/${application[0].applicationId}`; // Or env var for base URL

        const emailSubject = `New Visa Application: ${application[0].applicationId} - ${country.name}`;
        const emailBody = `
            <h3>New Visa Application Received</h3>
            <p><strong>Application ID:</strong> ${application[0].applicationId}</p>
            <p><strong>Agent:</strong> ${user.name} (${user.agencyName || 'No Agency'})</p>
            <p><strong>Country:</strong> ${country.name}</p>
            <p><strong>Visa Type:</strong> ${visaType}</p>
            <p><strong>Applicants:</strong> ${applicants.length}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <br/>
            <p>Click below to view full details and documents:</p>
            <a href="${adminDashboardLink}" style="padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">View Application</a>
            <br/><br/>
            <p>Documents (Passport, Photo, etc.) are available in the dashboard.</p>
        `;

        // We don't await this to prevent blocking response if email fails
        sendEmail(adminEmail, emailSubject, emailBody).catch(err => console.error('Failed to send admin notification:', err));

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Application Submitted Successfully',
            applicationId: application[0].applicationId,
            groupReferenceId: groupRef,
            remainingBalance: user.walletBalance
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

const { sendEmail } = require('../utils/emailService');

// @desc    Get applications (Agent: Own, Admin: All)
// @route   GET /api/applications
// @access  Private
exports.getMyApplications = async (req, res) => {
    try {
        const { search, status, country, page = 1, limit = 10 } = req.query;
        let query = {};

        // If not admin, restrict to own applications
        if (req.user.role !== 'admin') {
            query.agent = req.user._id;
        }

        // Search Filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { applicationId: searchRegex },
                { groupReferenceId: searchRegex },
                { groupName: searchRegex },
                { 'applicants.firstName': searchRegex },
                { 'applicants.lastName': searchRegex },
                { 'applicants.passportNumber': searchRegex }
            ];
        }

        // Status Filter
        if (status && status !== 'All') {
            query.status = status;
        }

        // Country Filter
        if (country && country !== 'All') {
            query.country = country;
        }

        const count = await Application.countDocuments(query);
        const applications = await Application.find(query)
            .populate('country', 'name flag')
            .populate('agent', 'name agencyName email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json({
            applications,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalCount: count
        });
    } catch (error) {
        console.error('Error in getMyApplications:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Application Status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const file = req.file; // For Approved Visa

        const application = await Application.findById(id).populate('agent', 'name email');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;

        // Handle specific statuses
        if (status === 'Rejected') {
            if (!rejectionReason) {
                return res.status(400).json({ message: 'Rejection reason is required' });
            }
            application.rejectionReason = rejectionReason;
            application.timeline.rejectedAt = Date.now();
        } else if (status === 'Approved') {
            if (file) {
                application.approvedVisaDocument = {
                    url: `/uploads/${file.filename}`,
                    uploadedAt: Date.now(),
                    originalName: file.originalname
                };
            }
            application.timeline.approvedAt = Date.now();
            application.timeline.deliveredAt = Date.now(); // Auto-deliver if approved?
        } else if (status === 'Processing') {
            application.timeline.processingAt = Date.now();
        }

        await application.save();

        // Send Email Notification
        const agentEmail = application.agent.email;
        const subject = `Visa Application Update: ${application.applicationId} is ${status}`;
        let emailBody = `<p>Dear ${application.agent.name},</p>
        <p>Your application <strong>${application.applicationId}</strong> has been updated to: <strong>${status}</strong>.</p>`;

        if (status === 'Rejected') {
            emailBody += `<p style="color:red;">Reason: ${rejectionReason}</p>`;
            emailBody += `<p>Please correct the issues and re-apply.</p>`;
        } else if (status === 'Approved') {
            emailBody += `<p>You can download the approved visa from your dashboard.</p>`;
        }

        await sendEmail(agentEmail, subject, emailBody);

        res.json({ message: `Application updated to ${status}`, application });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/applications/stats
// @access  Private
exports.getApplicationStats = async (req, res) => {
    try {
        const agentId = req.user._id;

        const stats = await Application.aggregate([
            { $match: { agent: agentId } },
            { $unwind: "$applicants" },
            {
                $group: {
                    _id: "$applicants.status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(s => {
            formattedStats.total += s.count;
            if (['Pending', 'Submitted', 'In Embassy', 'Processing'].includes(s._id)) {
                formattedStats.pending += s.count;
            } else if (s._id === 'Approved') {
                formattedStats.approved += s.count;
            } else if (s._id === 'Rejected') {
                formattedStats.rejected += s.count;
            }
        });

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track application status (Public)
// @route   GET /api/applications/track/:id
// @access  Public
exports.trackApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find by Application ID or Group Reference ID
        const application = await Application.findOne({
            $or: [
                { applicationId: id },
                { groupReferenceId: id }
            ]
        }).populate('country', 'name flag');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Mask Applicant Data
        const maskedApplicants = application.applicants.map(app => ({
            firstName: app.firstName,
            lastName: app.lastName ? `${app.lastName[0]}***` : '',
            passportNumber: app.passportNumber ? `${app.passportNumber.substring(0, 2)}******` : ''
        }));

        // Return public info matching StatusCard expectations
        res.json({
            applicationId: application.applicationId,
            status: application.status,
            country: application.country,
            visaType: application.visaType,
            createdAt: application.createdAt,
            travelDate: application.travelDate,
            returnDate: application.returnDate,
            timeline: application.timeline,
            paymentStatus: application.paymentStatus, // Required for 'Paid' step checkbox
            isGroupApplication: application.isGroupApplication, // Required for name display logic
            groupName: application.groupName,
            applicants: maskedApplicants, // Replaces 'mainApplicant' object to match UI
            rejectionReason: application.rejectionReason, // Display rejection reason
            approvedVisaDocument: application.status === 'Approved' ? application.approvedVisaDocument : null // Allow download if approved
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single application details (Private/Admin)
// @route   GET /api/applications/:id
// @access  Private [Admin or Owner]
exports.getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findOne({
            $or: [{ _id: id }, { applicationId: id }]
        })
            .populate('country', 'name flag')
            .populate('agent', 'name agencyName email phone kycStatus');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Access Control: Admin or Owner
        if (req.user.role !== 'admin' && application.agent._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
