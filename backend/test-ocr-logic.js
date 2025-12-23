const advancedOCRService = require('./utils/advancedOCRService');

const sampleFrontText = `
REPUBLIC OF INDIA
P<INDSINGH<<ALEX<XXXXXXXXXXXXXXXXXXXXXXX
Z0000000<0IND9001011M2801015<<<<<<<<<<<<<<<2
Surname
SINGH
Given Name(s)
ALEX
Date of Birth
10/05/1990
Sex
M
Place of Birth
NEW DELHI
Place of Issue
MUMBAI
Date of Issue
15/05/2020
Date of Expiry
14/05/2030
`;

const sampleBackText = `
Name of Father
JOHN SINGH
Name of Mother
MARY KAUR
Name of Spouse
SARAH SINGH
Address
123, EXAMPLE STREET
MUMBAI, MAHARASHTRA
PIN: 400001
File No: BOM12345678
`;

async function testLogic() {
    console.log("---- Testing Front Page Logic ----");
    const frontData = advancedOCRService.parsePassportDataAdvanced(sampleFrontText);
    console.log("Front Data:", JSON.stringify(frontData, null, 2));

    console.log("\n---- Testing Back Page Logic (Mocking OCR) ----");
    // We can't easily call processPassportBack without image buffer, so we mock the logic step here or assume the service exposes a text parser.
    // Since processPassportBack uses extractTextAdvanced internally, we can't extract without image.
    // However, we added logic inside processPassportBack which splits text.
    // Let's manually run the regex logic we added to verify it matches our sample text.

    const lines = sampleBackText.split('\n').map(l => l.trim()).filter(l => l);
    const backData = { maritalStatus: 'Not Found' };

    const spouseIdx = lines.findIndex(l => /Name of Spouse|Spouse's Name/i.test(l));
    if (spouseIdx !== -1 && lines[spouseIdx + 1]) {
        backData.maritalStatus = 'Married (Found: ' + lines[spouseIdx + 1] + ')';
    }
    console.log("Back Text Logic Result:", backData);
}

testLogic();
