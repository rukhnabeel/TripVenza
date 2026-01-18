require('dotenv').config();
const mongoose = require('mongoose');

console.log("Attempting to connect to MongoDB...");
console.log(`URI length: ${process.env.MONGO_URI ? process.env.MONGO_URI.length : 'undefined'}`);

// Override server selection to be short
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log("✅ Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection failed:");
        console.error(err.message);
        process.exit(1);
    });
