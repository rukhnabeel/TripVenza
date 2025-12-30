const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Attempting to connect to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ Connection Failed!');
        console.log('Error Name:', err.name);
        console.log('Error Message:', err.message);
        console.log('Error Code:', err.code);
        console.log('Full Error:', err);
        process.exit(1);
    });
