# 🔧 OCR Troubleshooting & Testing Guide

## Issue: OCR Only Extracting Passport Number

### ✅ Fixes Applied

1. **Fixed Jimp Compatibility Issue**
   - Replaced Jimp with Sharp for all preprocessing
   - Sharp is more reliable and faster

2. **Enhanced Logging**
   - Added raw OCR text output to console
   - Shows extracted data for debugging

3. **Improved Preprocessing**
   - Better contrast enhancement
   - Optimized sharpening
   - Adaptive binarization

---

## 🧪 How to Test

### Step 1: Upload a Passport Image

1. Go to: http://localhost:5173/ocr-demo
2. Click the upload area
3. Select a passport bio-data page image
4. Wait 20-30 seconds

### Step 2: Check Backend Logs

Open your backend terminal and look for:

```
🚀 Starting advanced OCR processing...
OCR Attempt 1: loading tesseract core
OCR Attempt 1: recognizing text
OCR Attempt 2: recognizing text
✅ OCR completed with XX% confidence
📄 Document type detected: passport
⚠️ MRZ parsing failed, using text extraction
📝 Raw OCR Text (first 500 chars): [TEXT HERE]
📊 Extracted Data: {
  "passportNumber": "...",
  "firstName": "...",
  "lastName": "...",
  ...
}
```

### Step 3: Analyze Results

**If you see raw text but no extracted data:**
- The regex patterns might not match your passport format
- Check the raw text in logs
- The passport might have unusual formatting

**If raw text is garbled:**
- Image quality is too poor
- Try a clearer image
- Ensure good lighting

---

## 📋 Best Practices for Good Results

### Image Quality

✅ **DO:**
- Use high-resolution images (minimum 300 DPI)
- Ensure good, even lighting
- Keep passport flat and straight
- Upload the bio-data page (page with photo)
- Use original photos (not screenshots)

❌ **DON'T:**
- Use blurry or out-of-focus images
- Upload images with shadows or glare
- Use heavily compressed images
- Upload partial passport pages

### Supported Passport Formats

The OCR works best with:
- ✅ Indian Passports
- ✅ Standard ICAO passports with MRZ
- ✅ Passports with clear English text
- ✅ Passports with visible MRZ (bottom 2 lines)

---

## 🔍 Debugging Steps

### 1. Check Raw OCR Text

Look at the backend logs for:
```
📝 Raw OCR Text (first 500 chars): ...
```

**If text is readable:**
- OCR is working
- Issue is with data extraction patterns
- Check if field names match (e.g., "Surname" vs "Last Name")

**If text is garbled:**
- Image quality issue
- Try different preprocessing settings
- Upload a clearer image

### 2. Check Extracted Data

Look for:
```
📊 Extracted Data: {
  "passportNumber": "K1234567",
  "firstName": null,
  "lastName": null,
  ...
}
```

**If only passport number is extracted:**
- Other fields don't match regex patterns
- Passport format is non-standard
- Field labels are in different language

### 3. Check MRZ Parsing

Look for:
```
✅ MRZ parsing successful
```
OR
```
⚠️ MRZ parsing failed, using text extraction
```

**If MRZ parsing fails:**
- MRZ lines not clearly visible in image
- MRZ damaged or unclear
- Image doesn't include MRZ area

---

## 🛠️ Manual Fixes

### If Specific Fields Not Extracting

1. **Check the passport format**
   - Look at how fields are labeled
   - Example: "Given Names" vs "First Name"

2. **Add custom patterns**
   - Edit `advancedOCRService.js`
   - Add new regex patterns for your passport format

Example:
```javascript
// If your passport says "Name" instead of "First Name"
const namePattern = /(?:Name)[:\s]*([A-Z][A-Z\s]+)/i;
```

### If Image Quality is Poor

1. **Enhance image before upload**
   - Increase brightness
   - Increase contrast
   - Remove shadows

2. **Try different angles**
   - Ensure passport is flat
   - Avoid perspective distortion

---

## 📊 Expected Results

### Good Quality Passport

```json
{
  "passportNumber": "K1234567",
  "firstName": "RAJESH",
  "lastName": "KUMAR",
  "dateOfBirth": "1985-03-15",
  "passportExpiry": "2028-03-14",
  "nationality": "INDIAN",
  "gender": "Male",
  "placeOfBirth": "NEW DELHI"
}
```

**Confidence**: 90-95%  
**Data Completeness**: 100%  
**MRZ Parsed**: Yes

### Poor Quality Passport

```json
{
  "passportNumber": "K1234567",
  "firstName": "RAJESH",
  "lastName": null,
  "dateOfBirth": "1985-03-15",
  "passportExpiry": null,
  "nationality": null,
  "gender": null
}
```

**Confidence**: 50-70%  
**Data Completeness**: 40-60%  
**MRZ Parsed**: No

---

## 🎯 Quick Fixes

### Problem: Only Passport Number Extracted

**Solution 1: Check Image Quality**
```bash
# Upload a clearer image
# Ensure all text is visible and readable
```

**Solution 2: Check Backend Logs**
```bash
# Look for raw OCR text
# Verify text is being extracted
# Check if field names match patterns
```

**Solution 3: Try Different Image**
```bash
# Use different lighting
# Try scanning instead of photo
# Ensure MRZ is visible
```

### Problem: Low Confidence Score

**Solution 1: Improve Image**
```bash
# Higher resolution
# Better lighting
# Clearer focus
```

**Solution 2: Check Preprocessing**
```bash
# Logs show preprocessing steps
# Verify image enhancement is working
```

### Problem: MRZ Parsing Failed

**Solution 1: Check MRZ Visibility**
```bash
# Ensure bottom 2 lines are in image
# MRZ should be clear and undamaged
# No shadows or glare on MRZ
```

**Solution 2: Manual Entry**
```bash
# If MRZ fails, text extraction is used
# Some fields may need manual entry
# Review and correct extracted data
```

---

## 📝 Testing Checklist

Before reporting issues, verify:

- [ ] Image is high quality (clear, well-lit)
- [ ] Entire bio-data page is visible
- [ ] MRZ (bottom 2 lines) is included
- [ ] Image is not compressed or blurry
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Checked backend logs for errors
- [ ] Tried with multiple passport images

---

## 🚀 Next Steps

1. **Test with your passport image**
2. **Check backend logs** for raw OCR text
3. **Share the logs** if you need help
4. **Try different images** to compare results

---

## 📞 Getting Help

If OCR still not working:

1. **Check backend logs** - Look for errors
2. **Share raw OCR text** - From logs
3. **Share passport format** - How fields are labeled
4. **Try test image** - Use a sample passport image

---

**Remember**: OCR accuracy depends heavily on image quality. Always use clear, well-lit, high-resolution images for best results!

---

**Status**: ✅ Fixes Applied  
**Server**: ✅ Auto-restarted  
**Ready to Test**: ✅ Yes

Try uploading a passport image now and check the backend logs!
