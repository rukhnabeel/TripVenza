const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function checkDatabase() {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB successfully!\n');

        const db = mongoose.connection.db;

        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('📊 Available Collections:');
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });

        console.log('\n📈 Collection Statistics:');

        // Get count for each collection
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  ${col.name}: ${count} documents`);

            if (col.name === 'users') {
                const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
                console.log('    -> User Emails:', JSON.stringify(users, null, 2));
            }
        }

        console.log('\n✅ Database check complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDatabase();
