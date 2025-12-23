const express = require('express');
const router = express.Router();
const { createApplication, getMyApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createApplication)
    .get(protect, getMyApplications);

module.exports = router;
