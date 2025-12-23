const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
