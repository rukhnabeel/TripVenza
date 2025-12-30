/**
 * OCR System Test Script
 * Tests the OCR service functionality
 */

const ocrService = require('./utils/ocrService');
const fs = require('fs').promises;
const path = require('path');

// Test data
const testPassportText = `
PASSPORT
Republic of India
भारत गणराज्य

Passport No. / पासपोर्ट संख्या
AB1234567

Surname / उपनाम
DOE

Given Names / दिए गए नाम
JOHN MICHAEL

Nationality / राष्ट्रीयता
INDIAN

Date of Birth / जन्म तिथि
15/01/1990

Sex / लिंग
M

Place of Birth / जन्म स्थान
MUMBAI

Date of Issue / जारी करने की तिथि
20/03/2020

Date of Expiry / समाप्ति तिथि
19/03/2030

P<INDDOE<<JOHN<MICHAEL<<<<<<<<<<<<<<<<<<<<
AB12345671IND9001155M3003195<<<<<<<<<<<<<<06
`;

const testMRZ = [
    'P<INDDOE<<JOHN<MICHAEL<<<<<<<<<<<<<<<<<<<<',
    'AB12345671IND9001155M3003195<<<<<<<<<<<<<<06'
];

async function runTests() {
    console.log('🧪 Starting OCR System Tests...\n');

    // Test 1: Parse Passport Data
    console.log('Test 1: Parse Passport Data');
    console.log('─'.repeat(50));
    try {
        const parsedData = ocrService.parsePassportData(testPassportText);
        console.log('✅ Passport Data Parsed Successfully:');
        console.log(JSON.stringify(parsedData, null, 2));
        console.log();
    } catch (error) {
        console.error('❌ Test 1 Failed:', error.message);
    }

    // Test 2: Parse MRZ
    console.log('Test 2: Parse MRZ (Machine Readable Zone)');
    console.log('─'.repeat(50));
    try {
        const mrzData = ocrService.parseMRZ(testMRZ);
        console.log('✅ MRZ Parsed Successfully:');
        console.log(JSON.stringify(mrzData, null, 2));
        console.log();
    } catch (error) {
        console.error('❌ Test 2 Failed:', error.message);
    }

    // Test 3: Date Parsing
    console.log('Test 3: Date Parsing');
    console.log('─'.repeat(50));
    try {
        const testDates = [
            '15/01/1990',
            '19-03-2030',
            '01/12/2025'
        ];

        console.log('✅ Date Parsing Results:');
        testDates.forEach(date => {
            const parsed = ocrService.parseDate(date);
            console.log(`  ${date} → ${parsed}`);
        });
        console.log();
    } catch (error) {
        console.error('❌ Test 3 Failed:', error.message);
    }

    // Test 4: MRZ Date Parsing
    console.log('Test 4: MRZ Date Parsing');
    console.log('─'.repeat(50));
    try {
        const testMRZDates = [
            '900115', // 15 Jan 1990
            '300319', // 19 Mar 2030
            '251201'  // 01 Dec 2025
        ];

        console.log('✅ MRZ Date Parsing Results:');
        testMRZDates.forEach(date => {
            const parsed = ocrService.parseMRZDate(date);
            console.log(`  ${date} → ${parsed}`);
        });
        console.log();
    } catch (error) {
        console.error('❌ Test 4 Failed:', error.message);
    }

    // Test 5: Full Passport Processing (if test image exists)
    console.log('Test 5: Full Passport Processing');
    console.log('─'.repeat(50));
    const testImagePath = path.join(__dirname, 'test-passport.jpg');

    try {
        const imageExists = await fs.access(testImagePath).then(() => true).catch(() => false);

        if (imageExists) {
            const imageBuffer = await fs.readFile(testImagePath);
            const result = await ocrService.processPassport(imageBuffer);

            if (result.success) {
                console.log('✅ Passport Processed Successfully:');
                console.log(`  Confidence: ${result.confidence.toFixed(2)}%`);
                console.log('  Extracted Data:');
                console.log(JSON.stringify(result.data, null, 2));
            } else {
                console.log('⚠️  Processing completed with errors:', result.message);
            }
        } else {
            console.log('⚠️  Test image not found at:', testImagePath);
            console.log('   To test with a real image, place a passport image at:');
            console.log(`   ${testImagePath}`);
        }
        console.log();
    } catch (error) {
        console.error('❌ Test 5 Failed:', error.message);
    }

    // Summary
    console.log('═'.repeat(50));
    console.log('✅ OCR System Tests Completed!');
    console.log('═'.repeat(50));
    console.log('\n📚 Next Steps:');
    console.log('  1. Start the backend server: npm run dev');
    console.log('  2. Test the API endpoint: POST /api/ocr/passport');
    console.log('  3. Upload a passport image through the frontend');
    console.log('  4. Check the OCR Demo page at /ocr-demo');
    console.log('\n📖 Documentation: See OCR_DOCUMENTATION.md for details\n');
}

// Run tests
runTests().catch(console.error);
