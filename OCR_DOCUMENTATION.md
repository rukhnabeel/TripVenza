# OCR System for Visa Application Filing

## Overview

This OCR (Optical Character Recognition) system automatically extracts passport information from uploaded images and auto-fills the visa application form. It uses **Tesseract.js** for text recognition and includes advanced passport parsing capabilities including MRZ (Machine Readable Zone) detection.

## Features

### 🎯 Core Capabilities
- **Automatic Data Extraction**: Extracts passport details from images
- **MRZ Parsing**: Reads Machine Readable Zone from passport bottom
- **Auto-Fill Forms**: Automatically populates application form fields
- **Confidence Scoring**: Provides accuracy confidence for extracted data
- **Multi-Format Support**: Handles JPEG, JPG, PNG images
- **Image Preprocessing**: Enhances image quality for better OCR accuracy
- **Batch Processing**: Process multiple passports at once
- **Data Verification**: Compare OCR results with manual input

### 📋 Extractable Fields
- Passport Number
- First Name
- Last Name
- Date of Birth
- Passport Expiry Date
- Nationality
- Gender
- Document Number

## Architecture

### Backend Components

#### 1. OCR Service (`backend/utils/ocrService.js`)
Core OCR processing engine with:
- Image preprocessing using Sharp
- Text extraction using Tesseract.js
- Passport data parsing
- MRZ (Machine Readable Zone) parsing
- Date format conversion

#### 2. Upload Middleware (`backend/middleware/upload.js`)
Multer-based file upload handler:
- File type validation
- File size limits (10MB max)
- Secure file storage
- Multiple upload configurations

#### 3. OCR Controller (`backend/controllers/ocrController.js`)
API endpoints for:
- Single passport processing
- Text extraction from any document
- Batch passport processing
- Data verification

#### 4. OCR Routes (`backend/routes/ocrRoutes.js`)
RESTful API endpoints:
- `POST /api/ocr/passport` - Process single passport
- `POST /api/ocr/extract` - Extract text from document
- `POST /api/ocr/batch-passport` - Process multiple passports
- `POST /api/ocr/verify` - Verify extracted data

### Frontend Components

#### 1. OCR Upload Component (`src/components/OCRUpload.jsx`)
React component featuring:
- Drag-and-drop file upload
- Image preview
- Real-time processing status
- Extracted data display
- Confidence score visualization
- Error handling

#### 2. Enhanced Apply Visa Page (`src/pages/ApplyVisa.jsx`)
Integrated OCR functionality:
- OCR upload section for each applicant
- Auto-fill form fields
- Manual override capability
- Visual feedback

## Installation

### Backend Dependencies

```bash
cd backend
npm install tesseract.js sharp cloudinary multer
```

### Dependencies Installed
- **tesseract.js**: OCR engine for text extraction
- **sharp**: Image processing and optimization
- **cloudinary**: Optional cloud storage for images
- **multer**: File upload middleware (already installed)

## Usage

### 1. Upload Passport Image

Users can upload a passport image in the visa application form:

```javascript
// The OCR component is integrated into each applicant section
<OCRUpload 
    onDataExtracted={handleOCRData}
    applicantIndex={index}
/>
```

### 2. Automatic Data Extraction

When an image is uploaded:
1. Image is sent to backend OCR endpoint
2. Image is preprocessed for better accuracy
3. Tesseract.js extracts text
4. Passport parser identifies relevant fields
5. MRZ is parsed if available
6. Data is returned with confidence score

### 3. Auto-Fill Form

Extracted data automatically populates form fields:
- First Name
- Last Name
- Passport Number
- Date of Birth
- Passport Expiry
- Nationality
- Gender

### 4. Manual Verification

Users can:
- Review auto-filled data
- Make corrections if needed
- Verify accuracy before submission

## API Endpoints

### Process Passport Image

```http
POST /api/ocr/passport
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- passport: [image file]

Response:
{
    "success": true,
    "data": {
        "passportNumber": "AB1234567",
        "firstName": "JOHN",
        "lastName": "DOE",
        "dateOfBirth": "1990-01-15",
        "passportExpiry": "2030-01-15",
        "nationality": "IND",
        "gender": "Male"
    },
    "confidence": 87.5,
    "message": "Passport data extracted successfully"
}
```

### Extract Text from Document

```http
POST /api/ocr/extract
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- document: [image file]

Response:
{
    "success": true,
    "text": "Extracted text content...",
    "confidence": 92.3,
    "message": "Text extracted successfully"
}
```

### Batch Process Passports

```http
POST /api/ocr/batch-passport
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- passports: [array of image files]

Response:
{
    "success": true,
    "results": [
        {
            "filename": "passport1.jpg",
            "success": true,
            "data": {...},
            "confidence": 85.2
        },
        ...
    ],
    "message": "Processed 3 passport images"
}
```

### Verify Extracted Data

```http
POST /api/ocr/verify
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "extractedData": {
        "passportNumber": "AB1234567",
        "firstName": "JOHN",
        ...
    },
    "manualData": {
        "passportNumber": "AB1234567",
        "firstName": "JOHN",
        ...
    }
}

Response:
{
    "success": true,
    "comparison": {
        "passportNumber": {
            "extracted": "AB1234567",
            "manual": "AB1234567",
            "matches": true
        },
        ...
    },
    "accuracy": "85.71",
    "message": "OCR accuracy: 85.71%"
}
```

## Data Model

The Application model has been enhanced to store OCR data:

```javascript
applicants: [{
    // ... existing fields
    ocrData: {
        extractedData: {
            firstName: String,
            lastName: String,
            passportNumber: String,
            passportExpiry: String,
            dateOfBirth: String,
            nationality: String,
            gender: String
        },
        confidence: Number,        // OCR confidence score (0-100)
        rawText: String,          // Raw OCR extracted text
        verified: Boolean,        // Whether data was verified by user
        extractedAt: Date
    }
}]
```

## Best Practices

### For Best OCR Results

1. **Image Quality**
   - Use high-resolution images (minimum 300 DPI)
   - Ensure good lighting
   - Avoid shadows and glare
   - Keep passport flat and straight

2. **Image Format**
   - JPEG or PNG format
   - Clear, focused images
   - Passport bio-data page fully visible
   - No obstructions or watermarks

3. **File Size**
   - Keep under 10MB
   - Compress if necessary
   - Balance quality vs. size

### Security Considerations

1. **File Validation**
   - Only accept image files
   - Validate file size
   - Sanitize filenames

2. **Data Privacy**
   - Store uploaded files securely
   - Implement access controls
   - Consider encryption for sensitive data
   - Auto-delete files after processing (optional)

3. **Authentication**
   - All OCR endpoints require authentication
   - Use JWT tokens
   - Implement rate limiting

## Troubleshooting

### Common Issues

#### Low Confidence Scores
- **Cause**: Poor image quality, blur, or low resolution
- **Solution**: Upload a clearer, higher-resolution image

#### Incorrect Data Extraction
- **Cause**: Unusual passport format or damaged passport
- **Solution**: Manually correct the auto-filled fields

#### Upload Fails
- **Cause**: File too large or wrong format
- **Solution**: Compress image or convert to JPEG/PNG

#### OCR Processing Timeout
- **Cause**: Large file size or server load
- **Solution**: Reduce image size or try again later

## Performance Optimization

### Image Preprocessing
- Grayscale conversion reduces processing time
- Normalization improves text clarity
- Sharpening enhances edge detection

### Caching
- Consider caching OCR results for duplicate uploads
- Store processed data in database

### Async Processing
- Use background jobs for batch processing
- Implement queue system for high volume

## Future Enhancements

### Planned Features
- [ ] Support for more document types (ID cards, driver's licenses)
- [ ] Multi-language OCR support
- [ ] Real-time camera capture
- [ ] AI-powered data validation
- [ ] Cloud storage integration (Cloudinary/AWS S3)
- [ ] OCR accuracy improvement with ML models
- [ ] Automatic document type detection
- [ ] Face detection and matching
- [ ] Barcode/QR code scanning

### Advanced Features
- [ ] Handwriting recognition
- [ ] Document authenticity verification
- [ ] Duplicate document detection
- [ ] Auto-rotation and perspective correction
- [ ] Multi-page document processing

## Testing

### Manual Testing

1. **Test with Sample Passport**
   ```bash
   # Upload a test passport image through the UI
   # Verify extracted data matches actual passport
   # Check confidence score
   ```

2. **Test Error Handling**
   ```bash
   # Upload invalid file type
   # Upload oversized file
   # Upload corrupted image
   ```

3. **Test Batch Processing**
   ```bash
   # Upload multiple passport images
   # Verify all are processed correctly
   ```

### API Testing with Postman/cURL

```bash
# Test passport processing
curl -X POST http://localhost:5000/api/ocr/passport \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "passport=@/path/to/passport.jpg"
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server logs for errors
4. Verify all dependencies are installed

## License

This OCR system is part of the TripVenza Visa Platform.

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained by**: TripVenza Development Team
