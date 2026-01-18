const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Country = require('./models/Country');
const connectDB = require('./config/db');

dotenv.config({ path: '.env' });

const checkCountries = async () => {
    try {
        await connectDB();
        const count = await Country.countDocuments();
        console.log(`Total Countries in DB: ${count}`);

        if (count > 0) {
            const sample = await Country.findOne();
            console.log('Sample Country:', sample.name, sample.code);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCountries();
