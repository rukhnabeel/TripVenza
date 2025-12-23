const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * OCR Service for extracting text from passport and document images
 */
class OCRService {
    /**
     * Preprocess image for better OCR accuracy
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Buffer>} Processed image buffer
     */
    async preprocessImage(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .greyscale()
                .normalize()
                .sharpen()
                .toBuffer();
        } catch (error) {
            console.error('Image preprocessing error:', error);
            return imageBuffer; // Return original if preprocessing fails
        }
    }

    /**
     * Extract text from image using Tesseract OCR
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Object>} OCR result with text and confidence
     */
    async extractText(imageBuffer) {
        try {
            // Preprocess image
            const processedImage = await this.preprocessImage(imageBuffer);

            // Perform OCR
            const result = await Tesseract.recognize(
                processedImage,
                'eng',
                {
                    logger: info => console.log('OCR Progress:', info)
                }
            );

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words
            };
        } catch (error) {
            console.error('OCR extraction error:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Parse passport data from OCR text
     * @param {string} text - OCR extracted text
     * @returns {Object} Parsed passport data
     */
    parsePassportData(text) {
        const data = {
            passportNumber: null,
            firstName: null,
            lastName: null,
            dateOfBirth: null,
            passportExpiry: null,
            nationality: null,
            gender: null,
            documentNumber: null
        };

        // Clean text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        const lines = text.split('\n').map(line => line.trim());

        // Extract Passport Number (various formats)
        // Format: P1234567, AB1234567, etc.
        const passportRegex = /(?:Passport\s*(?:No|Number|#)?[:\s]*)?([A-Z]{1,2}\d{6,9})/i;
        const passportMatch = cleanText.match(passportRegex);
        if (passportMatch) {
            data.passportNumber = passportMatch[1].toUpperCase();
        }

        // Extract MRZ (Machine Readable Zone) - Bottom two lines of passport
        // MRZ contains encoded passport information
        const mrzLines = lines.filter(line => line.length > 40 && /^[A-Z0-9<]+$/.test(line));
        if (mrzLines.length >= 2) {
            const mrz = this.parseMRZ(mrzLines.slice(-2));
            Object.assign(data, mrz);
        }

        // Extract Name (usually appears as "Surname, Given Names" or separate fields)
        const surnameRegex = /(?:Surname|Last\s*Name)[:\s]*([A-Z\s]+)/i;
        const givenNameRegex = /(?:Given\s*Names?|First\s*Name)[:\s]*([A-Z\s]+)/i;

        const surnameMatch = cleanText.match(surnameRegex);
        const givenNameMatch = cleanText.match(givenNameRegex);

        if (surnameMatch) {
            data.lastName = surnameMatch[1].trim();
        }
        if (givenNameMatch) {
            data.firstName = givenNameMatch[1].trim();
        }

        // Extract Date of Birth (various formats: DD/MM/YYYY, DD-MM-YYYY, etc.)
        const dobRegex = /(?:Date\s*of\s*Birth|DOB)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i;
        const dobMatch = cleanText.match(dobRegex);
        if (dobMatch) {
            data.dateOfBirth = this.parseDate(dobMatch[1]);
        }

        // Extract Expiry Date
        const expiryRegex = /(?:Date\s*of\s*Expiry|Expiry\s*Date|Valid\s*Until)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i;
        const expiryMatch = cleanText.match(expiryRegex);
        if (expiryMatch) {
            data.passportExpiry = this.parseDate(expiryMatch[1]);
        }

        // Extract Nationality
        const nationalityRegex = /(?:Nationality|Country)[:\s]*([A-Z]{3,})/i;
        const nationalityMatch = cleanText.match(nationalityRegex);
        if (nationalityMatch) {
            data.nationality = nationalityMatch[1];
        }

        // Extract Gender
        const genderRegex = /(?:Sex|Gender)[:\s]*([MF])/i;
        const genderMatch = cleanText.match(genderRegex);
        if (genderMatch) {
            data.gender = genderMatch[1] === 'M' ? 'Male' : 'Female';
        }

        return data;
    }

    /**
     * Parse MRZ (Machine Readable Zone) from passport
     * @param {Array<string>} mrzLines - Two lines of MRZ
     * @returns {Object} Parsed MRZ data
     */
    parseMRZ(mrzLines) {
        const data = {};

        if (mrzLines.length < 2) return data;

        try {
            const line1 = mrzLines[0].replace(/\s/g, '');
            const line2 = mrzLines[1].replace(/\s/g, '');

            // Line 1: P<COUNTRY_CODE<SURNAME<<GIVEN_NAMES
            if (line1.startsWith('P<')) {
                const countryCode = line1.substring(2, 5).replace(/</g, '');
                data.nationality = countryCode;

                const namePart = line1.substring(5).split('<<');
                if (namePart.length >= 2) {
                    data.lastName = namePart[0].replace(/</g, ' ').trim();
                    data.firstName = namePart[1].replace(/</g, ' ').trim();
                }
            }

            // Line 2: PASSPORT_NO<COUNTRY<DOB<GENDER<EXPIRY<PERSONAL_NO
            if (line2.length >= 44) {
                data.passportNumber = line2.substring(0, 9).replace(/</g, '');

                // Date of Birth (positions 13-18: YYMMDD)
                const dobStr = line2.substring(13, 19);
                if (/^\d{6}$/.test(dobStr)) {
                    data.dateOfBirth = this.parseMRZDate(dobStr);
                }

                // Gender (position 20)
                const gender = line2.charAt(20);
                if (gender === 'M' || gender === 'F') {
                    data.gender = gender === 'M' ? 'Male' : 'Female';
                }

                // Expiry Date (positions 21-26: YYMMDD)
                const expiryStr = line2.substring(21, 27);
                if (/^\d{6}$/.test(expiryStr)) {
                    data.passportExpiry = this.parseMRZDate(expiryStr);
                }
            }
        } catch (error) {
            console.error('MRZ parsing error:', error);
        }

        return data;
    }

    /**
     * Parse MRZ date format (YYMMDD) to ISO format
     * @param {string} mrzDate - Date in YYMMDD format
     * @returns {string} ISO date string
     */
    parseMRZDate(mrzDate) {
        if (!/^\d{6}$/.test(mrzDate)) return null;

        const yy = parseInt(mrzDate.substring(0, 2));
        const mm = mrzDate.substring(2, 4);
        const dd = mrzDate.substring(4, 6);

        // Assume 20xx for years 00-30, 19xx for years 31-99
        const yyyy = yy <= 30 ? 2000 + yy : 1900 + yy;

        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * Parse date from various formats to ISO format
     * @param {string} dateStr - Date string
     * @returns {string} ISO date string
     */
    parseDate(dateStr) {
        try {
            // Handle DD/MM/YYYY or DD-MM-YYYY
            const parts = dateStr.split(/[-/]/);
            if (parts.length === 3) {
                const [dd, mm, yyyy] = parts;
                return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            }
        } catch (error) {
            console.error('Date parsing error:', error);
        }
        return null;
    }

    /**
     * Process passport image and extract all data
     * @param {Buffer} imageBuffer - Passport image buffer
     * @returns {Promise<Object>} Extracted passport data with confidence score
     */
    async processPassport(imageBuffer) {
        try {
            // Extract text using OCR
            const ocrResult = await this.extractText(imageBuffer);

            // Parse passport data from extracted text
            const passportData = this.parsePassportData(ocrResult.text);

            return {
                success: true,
                data: passportData,
                confidence: ocrResult.confidence,
                rawText: ocrResult.text,
                message: 'Passport data extracted successfully'
            };
        } catch (error) {
            console.error('Passport processing error:', error);
            return {
                success: false,
                data: null,
                confidence: 0,
                rawText: '',
                message: error.message
            };
        }
    }
}

module.exports = new OCRService();
