# OCR System - Quick Setup Guide

## ✅ Installation Complete!

The OCR system has been successfully integrated into your visa application platform. Here's what was added:

## 📦 What's Included

### Backend Components
- ✅ **OCR Service** (`backend/utils/ocrService.js`) - Core OCR processing engine
- ✅ **Upload Middleware** (`backend/middleware/upload.js`) - File upload handling
- ✅ **OCR Controller** (`backend/controllers/ocrController.js`) - API endpoints
- ✅ **OCR Routes** (`backend/routes/ocrRoutes.js`) - RESTful routes
- ✅ **Enhanced Application Model** - Stores OCR data with confidence scores

### Frontend Components
- ✅ **OCR Upload Component** (`src/components/OCRUpload.jsx`) - Reusable upload widget
- ✅ **Enhanced Apply Visa Page** - Integrated OCR functionality
- ✅ **OCR Demo Page** (`src/pages/OCRDemo.jsx`) - Testing and demonstration

### Documentation & Testing
- ✅ **OCR Documentation** (`OCR_DOCUMENTATION.md`) - Complete guide
- ✅ **Test Script** (`backend/test-ocr.js`) - Automated testing
- ✅ **This Setup Guide** - Quick start instructions

## 🚀 Quick Start

### 1. Dependencies Installed
```bash
✅ tesseract.js - OCR engine
✅ sharp - Image processing
✅ cloudinary - Cloud storage (optional)
✅ multer - File uploads
```

### 2. Start the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npm run dev
```

### 3. Test the OCR System

**Option A: Use the Demo Page**
1. Navigate to `/ocr-demo` in your browser
2. Upload a passport image
3. See the extracted data

**Option B: Use the Application Form**
1. Go to the visa application page
2. Select a country and visa type
3. In the applicant section, use "Quick Fill with Passport Scan"
4. Upload a passport image
5. Form fields will auto-fill

**Option C: Test via API**
```bash
# Using curl (replace YOUR_TOKEN with actual JWT token)
curl -X POST http://localhost:5000/api/ocr/passport \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "passport=@/path/to/passport.jpg"
```

## 🎯 Features

### Automatic Data Extraction
- ✅ Passport Number
- ✅ First Name
- ✅ Last Name
- ✅ Date of Birth
- ✅ Passport Expiry
- ✅ Nationality
- ✅ Gender

### Advanced Capabilities
- ✅ MRZ (Machine Readable Zone) parsing
- ✅ Image preprocessing for better accuracy
- ✅ Confidence scoring
- ✅ Batch processing support
- ✅ Data verification

## 📝 API Endpoints

All endpoints require authentication (JWT token):

### Process Passport
```
POST /api/ocr/passport
Content-Type: multipart/form-data
Body: passport=[image file]
```

### Extract Text
```
POST /api/ocr/extract
Content-Type: multipart/form-data
Body: document=[image file]
```

### Batch Process
```
POST /api/ocr/batch-passport
Content-Type: multipart/form-data
Body: passports=[array of image files]
```

### Verify Data
```
POST /api/ocr/verify
Content-Type: application/json
Body: { extractedData: {...}, manualData: {...} }
```

## 🧪 Testing

### Run Automated Tests
```bash
cd backend
node test-ocr.js
```

### Test Results
```
✅ Passport Data Parsing
✅ MRZ Parsing
✅ Date Conversion
✅ Full Processing (with test image)
```

## 📁 File Structure

```
visa-platform/
├── backend/
│   ├── controllers/
│   │   └── ocrController.js          # OCR API endpoints
│   ├── middleware/
│   │   └── upload.js                 # File upload handling
│   ├── routes/
│   │   └── ocrRoutes.js             # OCR routes
│   ├── utils/
│   │   └── ocrService.js            # Core OCR service
│   ├── models/
│   │   └── Application.js           # Enhanced with OCR data
│   ├── uploads/                     # Uploaded files (auto-created)
│   └── test-ocr.js                  # Test script
├── src/
│   ├── components/
│   │   └── OCRUpload.jsx            # OCR upload component
│   └── pages/
│       ├── ApplyVisa.jsx            # Enhanced with OCR
│       └── OCRDemo.jsx              # Demo page
├── OCR_DOCUMENTATION.md             # Full documentation
└── OCR_SETUP.md                     # This file
```

## 🎨 Usage in Application

The OCR component is already integrated into the visa application form:

```jsx
// In ApplyVisa.jsx
<OCRUpload 
    onDataExtracted={handleOCRData}
    applicantIndex={index}
/>
```

When a user uploads a passport image:
1. Image is sent to backend OCR service
2. Text is extracted using Tesseract.js
3. Passport data is parsed (including MRZ if available)
4. Form fields are automatically filled
5. User can review and edit if needed

## 💡 Best Practices

### For Best OCR Results
1. **Image Quality**: Use high-resolution, clear images
2. **Lighting**: Ensure good, even lighting
3. **Format**: JPEG or PNG (under 10MB)
4. **Position**: Keep passport flat and straight
5. **Page**: Upload the bio-data page (page with photo)

### Security
- All endpoints require authentication
- Files are validated (type, size)
- Uploaded files are stored securely
- Consider implementing auto-cleanup of old files

## 🔧 Configuration

### Environment Variables
Add to `backend/.env` if using cloud storage:

```env
# Optional: Cloudinary for cloud storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Upload Settings
Modify in `backend/middleware/upload.js`:

```javascript
limits: {
    fileSize: 10 * 1024 * 1024 // 10MB (adjust as needed)
}
```

## 📊 Data Storage

OCR data is stored in the Application model:

```javascript
applicants: [{
    // ... regular fields
    ocrData: {
        extractedData: { /* OCR results */ },
        confidence: 87.5,
        rawText: "...",
        verified: false,
        extractedAt: Date
    }
}]
```

## 🐛 Troubleshooting

### Issue: Low Confidence Scores
**Solution**: Upload a clearer, higher-resolution image

### Issue: Incorrect Data
**Solution**: Manually correct the auto-filled fields

### Issue: Upload Fails
**Solution**: Check file size (max 10MB) and format (JPEG/PNG)

### Issue: OCR Not Working
**Solution**: 
1. Check backend server is running
2. Verify authentication token is valid
3. Check browser console for errors
4. Review backend logs

## 📚 Documentation

For detailed information, see:
- **Full Documentation**: `OCR_DOCUMENTATION.md`
- **API Reference**: In documentation file
- **Code Comments**: In source files

## 🎉 Next Steps

1. **Test with Real Passports**: Upload actual passport images
2. **Customize UI**: Modify OCRUpload component styling
3. **Add Features**: Implement additional document types
4. **Monitor Performance**: Track OCR accuracy and speed
5. **User Feedback**: Gather feedback from agents

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the full documentation
3. Check server logs for errors
4. Run the test script: `node backend/test-ocr.js`

## 🎯 Success Criteria

Your OCR system is working correctly if:
- ✅ Test script passes all tests
- ✅ Can upload passport images
- ✅ Data is extracted and displayed
- ✅ Form fields auto-fill correctly
- ✅ Confidence scores are shown
- ✅ Users can verify and edit data

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Last Updated**: December 2025

Enjoy your new OCR-powered visa application system! 🚀
