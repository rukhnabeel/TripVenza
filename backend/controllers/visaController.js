const Country = require('../models/Country');

// @desc    Get all countries
// @route   GET /api/visa/countries
// @access  Public (or Private)
exports.getCountries = async (req, res) => {
    try {
        const countries = await Country.find({ isActive: true }).select('name code flag region');
        res.json(countries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single country with visa types
// @route   GET /api/visa/countries/:id
// @access  Public
exports.getCountryDetails = async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);
        if (country) {
            res.json(country);
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
