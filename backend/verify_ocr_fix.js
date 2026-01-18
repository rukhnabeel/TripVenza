require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const axios = require('axios');

async function testSigning() {
    const fileUrl = 'https://res.cloudinary.com/dycnpdak9/image/upload/v1768726365/tripvenza_docs/visaDocument-1768726366274-960801403.pdf';
    console.log(`Testing with URL: ${fileUrl}`);

    try {
        let signedUrl = fileUrl;
        if (fileUrl.includes('cloudinary.com')) {
            const matches = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^/.]+)?$/);
            if (matches && matches[1]) {
                const publicId = matches[1];
                console.log(`Extracted Public ID: ${publicId}`);

                // Generate signing logic similar to the controller
                signedUrl = cloudinary.url(publicId, {
                    resource_type: fileUrl.includes('.pdf') ? 'image' : 'image', // Treat as image for extraction
                    format: 'pdf', // Explicitly set format
                    sign_url: true,
                    type: 'upload',
                    version: 1768726365 // Adding version explicitly as we saw in previous debug it matters
                });
                console.log(`Generated Signed URL: ${signedUrl}`);
            }
        }

        console.log('Attempting to fetch...');
        const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
        console.log(`Success! Status: ${response.status}, Size: ${response.data.length} bytes`);

    } catch (error) {
        console.error('Failed:', error.message);
        if (error.response) console.error('Status:', error.response.status);
    }
}

testSigning();
