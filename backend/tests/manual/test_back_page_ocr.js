const fs = require('fs');
const path = require('path');
const advancedOCRService = require('./utils/advancedOCRService');

async function testBackPageOCR() {
    try {
        console.log("\n🚀 ========== BACK PAGE OCR DEBUG TEST ==========\n");

        // Load sample back page image
        const imagePath = path.resolve(__dirname, '../public/samples/sample_passport_back.png');

        if (!fs.existsSync(imagePath)) {
            console.error("❌ Sample file not found:", imagePath);
            console.log("Please provide a passport back page image at:", imagePath);
            return;
        }

        const imageBuffer = fs.readFileSync(imagePath);
        console.log("✅ Loaded image:", imagePath);
        console.log("📦 Image size:", (imageBuffer.length / 1024).toFixed(2), "KB\n");

        // Call the back page OCR function
        console.log("🔍 Processing passport back page...\n");
        const result = await advancedOCRService.processPassportBack(imageBuffer);

        console.log("\n📊 ========== OCR RESULT ==========");
        console.log("Success:", result.success);
        console.log("Message:", result.message);
        console.log("\n📝 Extracted Data:");
        console.log("  Father's Name:", result.data?.fatherName || "(not extracted)");
        console.log("  Mother's Name:", result.data?.motherName || "(not extracted)");
        console.log("  Address:", result.data?.address || "(not extracted)");
        console.log("\n" + "=".repeat(50) + "\n");

        if (!result.data?.address) {
            console.log("⚠️  ADDRESS NOT EXTRACTED!");
            console.log("\nPossible reasons:");
            console.log("  1. OCR quality - text not readable");
            console.log("  2. Different format - 'Address' label not found");
            console.log("  3. Image preprocessing needed");
            console.log("\nCheck the console logs above for extracted text preview.");
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
        console.error(error.stack);
    }
}

// Run the test
testBackPageOCR();
