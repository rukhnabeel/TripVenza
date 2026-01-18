
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');
    } catch (err) {
        console.error('DB Error', err);
        process.exit(1);
    }
};

const searchData = async () => {
    await connectDB();

    // Define minimal schemas if models aren't loaded, or just require them if they exist
    // Easier to just use basic finds if we trust the collection names

    try {
        const User = require('./models/User');
        const Application = require('./models/Application');

        const regex = /Rukh|Nabeel/i;

        console.log('Searching Users...');
        const users = await User.find({
            $or: [{ name: regex }, { email: regex }]
        });
        console.log(`Found ${users.length} Users matching Rukh or Nabeel`);
        users.forEach(u => console.log(` - User: ${u.name} (${u.email})`));

        console.log('Searching Applications...');
        const apps = await Application.find({
            $or: [
                { 'applicants.firstName': regex },
                { 'applicants.lastName': regex }
            ]
        });
        console.log(`Found ${apps.length} Applications matching Rukh or Nabeel`);
        apps.forEach(a => {
            console.log(` - App ID: ${a.applicationId}`);
            a.applicants.forEach(app => {
                if (app.firstName.match(regex) || app.lastName.match(regex)) {
                    console.log(`   * Applicant: ${app.firstName} ${app.lastName}`);
                }
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

searchData();
