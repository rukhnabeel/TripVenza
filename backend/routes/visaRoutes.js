const express = require('express');
const router = express.Router();
const {
    getCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    getCountryDetails, // Note: Ensure this is exported or use getCountryById logic
    addVisaType,
    updateVisaType,
    deleteVisaType
} = require('../controllers/countryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes (Service List)
router.get('/countries', getCountries);
router.get('/countries/:id', async (req, res) => {
    // Re-implementing logic here or we can export a getCountryDetails from countryController
    // countryController.js didn't show getCountryDetails but it's likely we can use getCountryById logic internally
    const Country = require('../models/Country');
    try {
        const country = await Country.findById(req.params.id);
        if (country) res.json(country);
        else res.status(404).json({ message: 'Country not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Routes (Country Management)
router.post('/countries', protect, admin, createCountry);
router.put('/countries/:id', protect, admin, updateCountry);
router.delete('/countries/:id', protect, admin, deleteCountry);

// Admin Routes (Visa Management)
router.post('/countries/:id/visas', protect, admin, addVisaType);
router.put('/countries/:countryId/visas/:visaId', protect, admin, updateVisaType);
router.delete('/countries/:countryId/visas/:visaId', protect, admin, deleteVisaType);

module.exports = router;
