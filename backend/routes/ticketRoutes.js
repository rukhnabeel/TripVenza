const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, replyToTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);
router.get('/', protect, getMyTickets);
router.post('/:id/reply', protect, replyToTicket);

module.exports = router;
