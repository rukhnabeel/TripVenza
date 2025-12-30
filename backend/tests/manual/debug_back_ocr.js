
const fs = require('fs');
const path = require('path');
const advancedOCRService = require('./utils/advancedOCRService');

// Mock environment variables if needed
process.env.GOOGLE_CLOUD_API_KEY = "dummy_key_to_force_rest_attempt_or_fail";
// Note: If using real key, it would work. If using dummy, it will fail Google and fallback to Tesseract.

async function testBackPageOCR() {
    try {
        console.log("🚀 Starting Back Page OCR Test...");

        // Load sample image
        const imagePath = path.resolve(__dirname, '../public/samples/sample_passport_back.png');
        if (!fs.existsSync(imagePath)) {
            console.error("❌ Sample file not found:", imagePath);
            return;
        }

        const imageBuffer = fs.readFileSync(imagePath);

        // Call the service method directly
        console.log("Attempting processPassportBack...");
        const result = await advancedOCRService.processPassportBack(imageBuffer);

        console.log("✅ Result:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("❌ CRASHED:", error);
    }
}

testBackPageOCR();
