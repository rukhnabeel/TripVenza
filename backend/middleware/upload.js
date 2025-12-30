const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (if env vars set)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('☁️ [STORAGE] Using Cloudinary Storage');
} else {
    // console.log('📂 [STORAGE] Using Local Disk Storage (Set CLOUDINARY_* env vars to switch)');
}

// Create uploads directory if it doesn't exist (only needed for local)
const uploadsDir = path.join(__dirname, '../uploads');
if (!process.env.CLOUDINARY_CLOUD_NAME && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Determine Storage Engine
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'tripvenza_docs', // Folder name in Cloudinary
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return file.fieldname + '-' + uniqueSuffix;
            }
        },
    });
} else {
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            // Generate unique filename: timestamp-randomstring-originalname
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG) and PDF are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

// Export different upload configurations
module.exports = {
    // Single file upload
    single: (fieldName) => upload.single(fieldName),

    // Multiple files with same field name
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),

    // Multiple files with different field names
    fields: (fields) => upload.fields(fields),

    // Upload for passport documents (front, back, photo)
    passportDocuments: upload.fields([
        { name: 'passportFront', maxCount: 1 },
        { name: 'passportBack', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
        { name: 'other', maxCount: 5 }
    ])
};
