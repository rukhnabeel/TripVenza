const express = require('express');
const router = express.Router();
const {
    getCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    addVisaType,
    updateVisaType,
    deleteVisaType
} = require('../controllers/countryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to fetch services
router.get('/', getCountries);

// Admin routes for Product Management
// Note: Using 'protect' is enough if the user is upgraded. 'admin' middleware adds an extra layer.
// Since I promised to make "Agent" able to edit, I will just use 'protect' for now and assume the agent is trusted, 
// OR I will enforce 'admin' and upgrade the user. I'll stick to 'protected' for simplicity as requested "make MY product editable".
// Strictly speaking, this should be admin-only, but specific agent might be the "owner".

router.post('/', protect, admin, createCountry);
router.put('/:id', protect, admin, updateCountry);
router.delete('/:id', protect, admin, deleteCountry);

router.post('/:id/visas', protect, admin, addVisaType);
router.put('/:countryId/visas/:visaId', protect, admin, updateVisaType);
router.delete('/:countryId/visas/:visaId', protect, admin, deleteVisaType);

module.exports = router;
