const express = require('express');
const router = express.Router();
const { getCountries, getCountryDetails } = require('../controllers/visaController');

router.get('/countries', getCountries);
router.get('/countries/:id', getCountryDetails);

module.exports = router;
