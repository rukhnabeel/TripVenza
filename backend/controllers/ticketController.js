const Ticket = require('../models/Ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { subject, category, message, priority, relatedApplicationId } = req.body;

        const ticket = await Ticket.create({
            agent: req.user._id,
            subject,
            category,
            priority,
            relatedApplicationId,
            messages: [{
                sender: req.user._id,
                message,
                sentAt: Date.now()
            }]
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my tickets
// @route   GET /api/tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ agent: req.user._id })
            .sort({ updatedAt: -1 })
            .populate('relatedApplicationId', 'applicationId');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add reply to ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
exports.replyToTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, agent: req.user._id });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.messages.push({
            sender: req.user._id,
            message: req.body.message,
            sentAt: Date.now()
        });

        ticket.status = 'Open'; // Re-open if closed by admin? or just User replied logic
        await ticket.save();

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
