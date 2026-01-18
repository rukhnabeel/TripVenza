const express = require('express');
const router = express.Router();
const { getMaintenanceStatus, toggleMaintenanceMode } = require('../controllers/systemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/maintenance', getMaintenanceStatus);
router.post('/maintenance', protect, admin, toggleMaintenanceMode);

module.exports = router;
