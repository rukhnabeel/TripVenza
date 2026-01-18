require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const publicId = 'tripvenza_docs/visaDocument-1768726366274-960801403';

console.log("Checking resource:", publicId);

cloudinary.api.resource(publicId, (error, result) => {
    if (error) {
        console.log("Error (default type):", error.message);
        // Try raw
        cloudinary.api.resource(publicId, { resource_type: 'raw' }, (err2, res2) => {
            if (err2) console.log("Error (raw type):", err2.message);
            else console.log("Found as RAW:", res2);
        });
    } else {
        console.log("Found Resource:", result);
    }
});
