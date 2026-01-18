require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const pdf = require('pdf-parse');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const publicId = 'tripvenza_docs/visaDocument-1768726366274-960801403';

async function run() {
    try {
        // Generate Signed URL just in case
        const url = cloudinary.url(publicId, {
            resource_type: 'image',
            sign_url: true,
            format: 'pdf',
            version: 1768726365
        });

        console.log("Generated Signed URL:", url);

        console.log("Fetching PDF...");
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        console.log("Parsing PDF...");
        const data = await pdf(response.data);
        console.log("\n--- PDF CONTENT START ---");
        console.log(data.text);
        console.log("--- PDF CONTENT END ---");
    } catch (error) {
        console.error("Error processing PDF:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data.toString());
        }
    }
}

run();
