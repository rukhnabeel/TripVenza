const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Country = require('./models/Country');
const connectDB = require('./config/db');

dotenv.config({ path: '.env' });

const checkVisaTypes = async () => {
    try {
        await connectDB();

        const count = await Country.countDocuments();
        console.log(`Total Countries: ${count}`);

        // Check UAE specifically as it's a likely test case
        const uae = await Country.findOne({ code: 'AE' });
        if (uae) {
            console.log(`\nCountry: ${uae.name} (${uae.code})`);
            console.log(`Visa Types Count: ${uae.visaTypes?.length || 0}`);
            if (uae.visaTypes && uae.visaTypes.length > 0) {
                console.log('Sample Visa Type:', uae.visaTypes[0].type);
            } else {
                console.log('⚠️ No visa types defined for UAE.');
            }
        } else {
            console.log('UAE not found.');
        }

        // Check global stats
        const countriesWithVisas = await Country.countDocuments({ 'visaTypes.0': { $exists: true } });
        console.log(`\nCountries with at least one visa type: ${countriesWithVisas}`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkVisaTypes();
