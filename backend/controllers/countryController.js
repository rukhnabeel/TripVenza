const Country = require('../models/Country');

// @desc    Get all countries (Service List)
// @route   GET /api/countries
// @access  Public
const getCountries = async (req, res) => {
    try {
        const countries = await Country.find({});
        res.json(countries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new country
// @route   POST /api/countries
// @access  Private/Admin
const createCountry = async (req, res) => {
    try {
        const { name, code, region, flag, description } = req.body;

        const countryExists = await Country.findOne({ code });
        if (countryExists) {
            return res.status(400).json({ message: 'Country already exists' });
        }

        const country = await Country.create({
            name,
            code,
            region: region || 'Asia',
            flag,
            description,
            visaTypes: []
        });

        res.status(201).json(country);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update country details
// @route   PUT /api/countries/:id
// @access  Private/Admin
const updateCountry = async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);

        if (country) {
            country.name = req.body.name || country.name;
            country.code = req.body.code || country.code;
            country.flag = req.body.flag || country.flag;
            country.region = req.body.region || country.region;
            country.description = req.body.description || country.description;

            const updatedCountry = await country.save();
            res.json(updatedCountry);
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a country
// @route   DELETE /api/countries/:id
// @access  Private/Admin
const deleteCountry = async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);

        if (country) {
            await country.deleteOne();
            res.json({ message: 'Country removed' });
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a visa type to a country
// @route   POST /api/countries/:id/visas
// @access  Private/Admin
const addVisaType = async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);

        if (country) {
            const {
                type, processingTime, validity, stayPeriod, entryType,
                govtFee, baseServiceFee, tieredServiceFees,
                documentsRequired, description
            } = req.body;

            const calculatedTotalFee = Number(govtFee) + Number(baseServiceFee);

            const newVisa = {
                type, processingTime, validity, stayPeriod, entryType,
                govtFee, baseServiceFee, tieredServiceFees,
                totalFee: calculatedTotalFee,
                documentsRequired, description
            };

            country.visaTypes.push(newVisa);
            await country.save();
            res.status(201).json(country);
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        console.error('Add Visa Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a visa type
// @route   PUT /api/countries/:countryId/visas/:visaId
// @access  Private/Admin
const updateVisaType = async (req, res) => {
    try {
        const country = await Country.findById(req.params.countryId);

        if (country) {
            const visa = country.visaTypes.id(req.params.visaId);

            if (visa) {
                if (req.body.type) visa.type = req.body.type;
                if (req.body.processingTime) visa.processingTime = req.body.processingTime;
                if (req.body.validity) visa.validity = req.body.validity;
                if (req.body.stayPeriod) visa.stayPeriod = req.body.stayPeriod;
                if (req.body.entryType) visa.entryType = req.body.entryType;

                // Fee Updates
                if (req.body.govtFee !== undefined) visa.govtFee = req.body.govtFee;
                if (req.body.baseServiceFee !== undefined) visa.baseServiceFee = req.body.baseServiceFee;
                if (req.body.tieredServiceFees) visa.tieredServiceFees = req.body.tieredServiceFees;

                // Always recalculate totalFee to ensure consistency
                visa.totalFee = Number(visa.govtFee) + Number(visa.baseServiceFee);

                if (req.body.documentsRequired) visa.documentsRequired = req.body.documentsRequired;
                if (req.body.description) visa.description = req.body.description;

                await country.save();
                res.json(country);
            } else {
                res.status(404).json({ message: 'Visa Type not found' });
            }
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a visa type
// @route   DELETE /api/countries/:countryId/visas/:visaId
// @access  Private/Admin
const deleteVisaType = async (req, res) => {
    try {
        const country = await Country.findById(req.params.countryId);

        if (country) {
            // Mongoose array pull method
            country.visaTypes.pull({ _id: req.params.visaId });
            await country.save();
            res.json(country);
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    addVisaType,
    updateVisaType,
    deleteVisaType
};
