const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Country = require('../../models/Country');
const User = require('../../models/User');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const countries = await Country.find({});
        console.log(`Countries Count: ${countries.length}`);
        if (countries.length > 0) {
            console.log('First Country:', JSON.stringify(countries[0], null, 2));
            console.log('isActive:', countries[0].isActive);
        }

        const agents = await User.find({ role: 'agent' });
        console.log(`Agents Count: ${agents.length}`);
        if (agents.length > 0) {
            console.log('First Agent:', agents[0].email);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
