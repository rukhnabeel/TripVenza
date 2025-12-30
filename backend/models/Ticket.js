const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['Payment', 'Application Delay', 'Rejection', 'Technical'], required: true },

    // Optional Link to Application
    relatedApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Agent or Admin
        message: String,
        attachments: [String],
        sentAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
