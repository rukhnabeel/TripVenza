require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const axios = require('axios');

const publicId = 'tripvenza_docs/visaDocument-1768726366274-960801403';
const version = 1768726365;

async function checkUrl(url, label) {
    try {
        console.log(`\nTesting [${label}]: ${url}`);
        const response = await axios.head(url);
        console.log(`✅ SUCCESS! Status: ${response.status}`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED. Status: ${err.response ? err.response.status : err.message}`);
        return false;
    }
}

async function run() {
    // Strategy 1: Signed Upload (what we tried)
    const urlUpload = cloudinary.url(publicId, {
        resource_type: 'image',
        format: 'pdf',
        sign_url: true,
        type: 'upload',
        version: version
    });
    await checkUrl(urlUpload, 'Signed Upload');

    // Strategy 2: Signed Private
    const urlPrivate = cloudinary.url(publicId, {
        resource_type: 'image',
        format: 'pdf',
        sign_url: true,
        type: 'private',
        version: version
    });
    await checkUrl(urlPrivate, 'Signed Private');

    // Strategy 3: Signed Authenticated
    const urlAuth = cloudinary.url(publicId, {
        resource_type: 'image',
        format: 'pdf',
        sign_url: true,
        type: 'authenticated',
        version: version
    });
    await checkUrl(urlAuth, 'Signed Authenticated');

    // Strategy 4: Raw resource type
    const urlRaw = cloudinary.url(publicId, {
        resource_type: 'raw',
        sign_url: true,
        type: 'upload',
        version: version
    });
    await checkUrl(urlRaw, 'Signed Raw');
}

run();
