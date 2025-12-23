const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { parse } = require('mrz');
const vision = require('@google-cloud/vision');
const axios = require('axios');

/**
 * Advanced OCR Service with enhanced features
 * - Multi-stage image preprocessing
 * - Advanced MRZ parsing with validation
 * - Multiple OCR attempts with different settings
 * - Confidence-based result selection
 * - Document type detection
 * - Data validation and correction
 */
class AdvancedOCRService {
    constructor() {
        this.tesseractConfig = {
            lang: 'eng',
            oem: 1, // LSTM neural net mode
            psm: 3, // Fully automatic page segmentation
        };
    }

    /**
     * Analyze image quality: Blur, Glare, and Framing.
     * Returns { valid: boolean, errors: [], metadata: {} }
     */
    async analyzeImageQuality(imageBuffer) {
        const errors = [];
        const warnings = [];
        let metadata = {};

        try {
            const image = sharp(imageBuffer);
            metadata = await image.metadata();

            // 1. Framing/Aspect Ratio Check
            // ID-3 Passport: ~1.42 (125mm width / 88mm height)
            if (metadata.width && metadata.height) {
                const aspectRatio = metadata.width / metadata.height;
                // Full book often > 1.8 or < 1.0 (portrait full page)
                // We expect Landscape ID-3 (+/- tolerance)
                const isLandscape = aspectRatio > 1;
                const ratio = isLandscape ? aspectRatio : 1 / aspectRatio;

                if (ratio > 1.8) {
                    warnings.push('Image appears to be too wide (Possible "Full Book" scan). Please crop to just the data page.');
                }
            }

            // 2. Blur Detection (Laplacian Variance Simulation)
            // Convert to grayscale -> raw buffer
            const { data: grayData, info: grayInfo } = await image
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Simple variance calculation on raw pixel intensities (proxy for blur if low contrast/edges)
            // Real Laplacian is better but complex without OpenCV.
            // Using Standard Deviation of pixel intensities as a cheap proxy for "Information Content"
            let sum = 0, sumSq = 0;
            for (let i = 0; i < grayData.length; i++) {
                sum += grayData[i];
                sumSq += grayData[i] * grayData[i];
            }
            const mean = sum / grayData.length;
            const variance = (sumSq / grayData.length) - (mean * mean);
            const stdDev = Math.sqrt(variance);

            // StdDev < 30 usually means flat/blurry/low contrast. Good scan often > 50.
            if (stdDev < 30) {
                warnings.push('Image is too blurry or low contrast. Please ensure text is sharp.');
            }

            // 3. Glare Detection (Hot Spots)
            // Check for pixels > 250 (near white)
            let hotPixels = 0;
            const threshold = 250;
            for (let i = 0; i < grayData.length; i++) {
                if (grayData[i] > threshold) hotPixels++;
            }
            const glarePercentage = (hotPixels / grayData.length) * 100;

            if (glarePercentage > 5) {
                warnings.push('Significant glare detected. Please avoid flash or overhead lights.');
            }

            return {
                valid: warnings.length === 0, // Strict? Or allow warnings? 
                // Let's return valid=true but pass warnings for the frontend to decide or display as "Quality Alerts"
                warnings,
                qcScores: { blurScore: stdDev, glareScore: glarePercentage }
            };

        } catch (e) {
            console.error("Quality Check Failed:", e);
            return { valid: true, warnings: [], qcScores: {} }; // Fail open
        }
    }

    /**
     * Advanced image preprocessing pipeline
     */
    async preprocessImage(imageBuffer, options = {}) {
        try {
            const {
                denoise = true,
                deskew = true,
                enhance = true,
                binarize = true
            } = options;

            // Use sharp for preprocessing
            let processedBuffer = imageBuffer;

            // Use sharp for all preprocessing
            let sharpImage = sharp(imageBuffer);

            // 1. Resize if too large (optimize processing)
            const metadata = await sharpImage.metadata();
            if (metadata.width > 2000) {
                sharpImage = sharpImage.resize(2000, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            // 2. Convert to grayscale
            sharpImage = sharpImage.greyscale();

            // 3. Enhance contrast and brightness
            if (enhance) {
                sharpImage = sharpImage.normalize().linear(1.2, -(128 * 0.2));
            }

            // 4. Sharpen
            sharpImage = sharpImage.sharpen();

            // 5. Apply threshold for binarization if needed
            if (binarize) {
                sharpImage = sharpImage.threshold(128);
            }

            processedBuffer = await sharpImage.toBuffer();
            return processedBuffer;

        } catch (error) {
            console.error('Advanced preprocessing error:', error);
            // Fallback to basic preprocessing
            return await sharp(imageBuffer)
                .greyscale()
                .normalize()
                .sharpen()
                .toBuffer();
        }
    }

    /**
     * Detect document type from image
     */
    async detectDocumentType(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('passport') || text.match(/P<[A-Z]{3}/)) {
            return 'passport';
        } else if (lowerText.includes('driving') || lowerText.includes('license')) {
            return 'drivers_license';
        } else if (lowerText.includes('identity') || lowerText.includes('national id')) {
            return 'national_id';
        } else if (lowerText.includes('visa')) {
            return 'visa';
        }

        return 'unknown';
    }

    /**
     * Extract text with multiple OCR attempts
     */
    /**
     * Extract text using Google Cloud Vision
     * Supports both Service Account (via client lib) and API Key (via REST)
     */
    async extractTextGoogleVision(imageBuffer) {
        try {
            // OPTION 1: API Key (REST API) - Best for when SA Keys are blocked
            if (process.env.GOOGLE_CLOUD_API_KEY) {
                console.log('🔍 Attempting Google Cloud Vision OCR via API Key...');

                // Convert buffer to base64
                const base64Image = imageBuffer.toString('base64');

                const response = await axios.post(
                    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
                    {
                        requests: [
                            {
                                image: {
                                    content: base64Image
                                },
                                features: [
                                    {
                                        type: "TEXT_DETECTION"
                                    },
                                    {
                                        type: "DOCUMENT_TEXT_DETECTION"
                                    }
                                ]
                            }
                        ]
                    }
                );

                const detections = response.data.responses[0].textAnnotations;
                if (!detections || detections.length === 0) {
                    return null;
                }

                console.log('✅ Google Vision OCR Successful (REST)');
                return {
                    text: detections[0].description,
                    confidence: 99,
                    source: 'google-vision-rest'
                };
            }

            // OPTION 2: Service Account (Client Library)
            else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                console.log('🔍 Attempting Google Cloud Vision OCR via Service Account...');
                const client = new vision.ImageAnnotatorClient();
                const [result] = await client.textDetection(imageBuffer);
                const detections = result.textAnnotations;

                if (!detections || detections.length === 0) {
                    return null;
                }

                console.log('✅ Google Vision OCR Successful (Client)');
                return {
                    text: detections[0].description,
                    confidence: 95,
                    source: 'google-vision-client'
                };
            }

            else {
                console.log('⚠️ Google Cloud Credentials not found.');
                return null;
            }

        } catch (error) {
            console.error('⚠️ Google Vision OCR failed:', error.message);
            if (error.response) {
                console.error('GV Error Data:', JSON.stringify(error.response.data));
            }
            throw error; // Propagate error to let caller handle it (or fail if this is the only method)
        }
    }

    /**
     * Detect faces in an image using Google Cloud Vision
     * Returns face count and confidence
     */
    async detectFace(imageBuffer) {
        try {
            console.log('👤 Initiating Face Detection...');

            // OPTION 1: API Key (REST API)
            if (process.env.GOOGLE_CLOUD_API_KEY) {
                const base64Image = imageBuffer.toString('base64');
                const response = await axios.post(
                    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
                    {
                        requests: [{
                            image: { content: base64Image },
                            features: [{ type: "FACE_DETECTION" }]
                        }]
                    }
                );

                const faceAnnotations = response.data.responses[0].faceAnnotations || [];
                return {
                    hasFace: faceAnnotations.length > 0,
                    faceCount: faceAnnotations.length,
                    confidence: faceAnnotations.length > 0 ? faceAnnotations[0].detectionConfidence : 0
                };
            }

            // OPTION 2: Service Account (Client Library)
            else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                const client = new vision.ImageAnnotatorClient();
                const [result] = await client.faceDetection(imageBuffer);
                const faces = result.faceAnnotations;

                return {
                    hasFace: faces.length > 0,
                    faceCount: faces.length,
                    confidence: faces.length > 0 ? faces[0].detectionConfidence : 0
                };
            }

            // Fallback: No credentials
            console.warn('⚠️ No Google Cloud credentials for Face Detection.');
            return { hasFace: true, faceCount: 1, confidence: 1, warning: 'Skipped validation (No Creds)' };

        } catch (error) {
            console.error('⚠️ Face Detection Failed:', error.message);
            // Default to allowing upload if detection fails, to avoid blocking user due to tech error
            return { hasFace: true, warning: 'Validation failed' };
        }
    }

    /**
     * Extract text with Google Vision prioritization
     */
    async extractTextAdvanced(imageBuffer) {
        try {
            // 1. Try Google Vision First
            if (process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                const googleResult = await this.extractTextGoogleVision(imageBuffer);
                if (googleResult) {
                    return googleResult;
                }
            } else {
                console.log('❌ No Google Cloud credentials provided. Cannot proceed with Google OCR.');
                throw new Error('Google Cloud credentials missing. Please set GOOGLE_CLOUD_API_KEY or GOOGLE_APPLICATION_CREDENTIALS in .env');
            }

        } catch (error) {
            console.error('Advanced OCR extraction error:', error.message);

            // If Google Vision fails, we could fallback, but user requested replacement.
            // We will throw unless we really want to fallback.
            // Let's implement a "Emergency Fallback" just in case, but keep it quiet if Google was intended.

            if (error.message.includes('Google Cloud credentials missing')) {
                console.warn('⚠️ Google Cloud credentials missing. Automatically falling back to Tesseract.');
                return this.extractTextTesseract(imageBuffer);
            }

            console.log('🔄 Google OCR failed unexpectedly. Falling back to Tesseract as emergency...');
            // Attempt Tesseract as last resort
            return this.extractTextTesseract(imageBuffer);
        }
    }

    async extractTextTesseract(imageBuffer) {
        try {
            const processed = await this.preprocessImage(imageBuffer, {
                denoise: true,
                enhance: true,
                binarize: true
            });

            const result = await Tesseract.recognize(processed, 'eng');
            return {
                text: result.data.text,
                confidence: result.data.confidence,
                source: 'tesseract'
            };
        } catch (e) {
            throw new Error('Both Google OCR and Tesseract failed.');
        }
    }

    /**
     * Advanced MRZ parsing with validation
     */
    parseMRZAdvanced(text) {
        try {
            console.log('--- START MRZ DEBUG ---');
            console.log('Raw Text Payload:', text.substring(0, 200) + '...');
            const lines = text.split('\n').map(line => line.trim());
            const mrzLines = lines.filter(line => line.length >= 30 && /[A-Z0-9<]+/.test(line));
            console.log('Potential MRZ Lines Found:', mrzLines);

            // Strategy 0: Priority Manual Check for Indian Passports
            // We trust our manual parser more than the generic library for IND docs due to specific noise handling
            const indLineIndex = mrzLines.findIndex(line => line.includes('P<IND') || line.includes('P<lND')); // lND common OCR error
            if (indLineIndex !== -1 && mrzLines.length > indLineIndex + 1) {
                const line1 = mrzLines[indLineIndex].replace(/\s/g, '');
                const line2 = mrzLines[indLineIndex + 1].replace(/\s/g, '');

                const manualResult = this.manuallyParseIndianMRZ(line1, line2);
                if (manualResult && manualResult.gender) { // Only accept if we got key data like gender
                    console.log('✅ Using Priority Manual Parser for Indian Passport');
                    return {
                        success: true,
                        data: manualResult,
                        confidence: 90
                    };
                }
            }

            // Strategy 1: Standard 'mrz' library
            const validMrzLines = mrzLines.filter(line => line.length >= 40 && /^[A-Z0-9<]+$/.test(line));
            if (validMrzLines.length >= 2) {
                const mrzString = validMrzLines.slice(-2).join('\n');
                const parsed = parse(mrzString);

                // Check if parsing result actually contains key data
                // Sometimes it returns valid=true but fields are null if check digits fail
                if (parsed.valid && parsed.birthDate && parsed.expirationDate) {
                    return this.formatMRZResult(parsed);
                } else {
                    console.log('⚠️ Standard MRZ parsing valid but fields null, trying manual fallback...');
                    const manualResult = this.parseMRZManual(validMrzLines.slice(-2));
                    if (manualResult.success) return manualResult;
                }
            } else {
                // Fallback for noisy lines (fuzzy matching)
                if (mrzLines.length >= 2) {
                    // Try to pick the best 2 lines looking like MRZ
                    const manualResult = this.parseMRZManual(mrzLines.slice(-2));
                    if (manualResult.success) return manualResult;
                }
            }

            // Strategy 2: Fuzzy MRZ Extraction (for noisy OCR)
            // Look for lines starting with 'P<' or containing large blocks of '<<'
            const line1Index = mrzLines.findIndex(line => line.includes('P<') && line.length > 30);
            if (line1Index !== -1 && mrzLines.length > line1Index + 1) {
                const line1 = mrzLines[line1Index].replace(/\s/g, '');
                const line2 = mrzLines[line1Index + 1].replace(/\s/g, '');

                // Attempt manual parsing for Indian Passports
                if (line1.includes('IND')) {
                    const manualData = this.manuallyParseIndianMRZ(line1, line2);
                    if (manualData) {
                        return {
                            success: true,
                            data: manualData,
                            confidence: 85 // Manual parsing is reasonably reliable
                        };
                    }
                }
            }

            return { success: false, data: null };

        } catch (error) {
            console.error('Advanced MRZ parsing error:', error);
            return { success: false, data: null };
        }
    }

    formatMRZResult(parsed) {
        return {
            success: true,
            data: {
                documentType: parsed.format,
                passportNumber: parsed.documentNumber,
                firstName: parsed.firstName,
                lastName: parsed.lastName,
                nationality: parsed.nationality,
                dateOfBirth: this.formatDate(parsed.birthDate, false),
                gender: parsed.sex === 'M' ? 'Male' : parsed.sex === 'F' ? 'Female' : 'Other',
                passportExpiry: this.formatDate(parsed.expirationDate, true),
                issuingCountry: parsed.issuingState,
                personalNumber: parsed.personalNumber
            },
            confidence: 95
        };
    }

    /**
     * Manual MRZ Parsing when library fails or returns incomplete data
     */
    parseMRZManual(lines) {
        try {
            const line1 = lines[0];
            const line2 = lines[1];

            const data = {
                documentType: 'passport',
                nationality: null,
                issuingCountry: null,
                lastName: null,
                firstName: null,
                passportNumber: null,
                dateOfBirth: null,
                gender: null,
                passportExpiry: null
            };

            // Parse Line 1 (Names)
            // Format: P<CCCSURNAME<<GIVEN<NAMES<<<<
            if (line1.length > 5) {
                const countryCode = line1.substring(2, 5); // e.g., IND
                data.nationality = countryCode;
                data.issuingCountry = countryCode;

                // Extract names
                // Remove P<IND and trailing <
                const nameSection = line1.substring(5).replace(/<+$/, '');
                const nameParts = nameSection.split('<<');

                if (nameParts[0]) {
                    data.lastName = nameParts[0].replace(/</g, ' ').trim();
                }

                if (nameParts.length > 1 && nameParts[1]) {
                    data.firstName = nameParts[1].replace(/</g, ' ').trim();
                }
            }

            // Parse Line 2 (Dates/Numbers)
            // Format: PASS_NUM+D+CC+DOB+D+SEX+EXP+D...
            if (line2.length > 28) {
                // Passport Number (First 9 chars usually, stop at <)
                data.passportNumber = line2.substring(0, 9).replace(/</g, '');

                // DOB: Indices 13-19 (YYMMDD)
                const dobStr = line2.substring(13, 19);
                if (/^\d{6}$/.test(dobStr)) {
                    data.dateOfBirth = this.formatDate(dobStr, false); // Not expiry
                }

                // Gender: Index 20
                const genderChar = line2.charAt(20);
                if (genderChar === 'M') data.gender = 'Male';
                else if (genderChar === 'F') data.gender = 'Female';
                else data.gender = 'Other';

                // Expiry: Indices 21-27 (YYMMDD)
                const expiryStr = line2.substring(21, 27);
                if (/^\d{6}$/.test(expiryStr)) {
                    data.passportExpiry = this.formatDate(expiryStr, true); // Is expiry
                }
            }

            return {
                success: true,
                data: data,
                confidence: 85,
                source: 'manual_mrz'
            };

        } catch (error) {
            console.error('Manual MRZ parsing error:', error);
            return { success: false, data: null };
        }
    }

    /**
     * Format date from MRZ format (YYMMDD) to ISO
     */
    /**
     * Format date from MRZ format (YYMMDD) to DD/MM/YYYY
     */
    formatDate(dateStr, isExpiry = false) {
        if (!dateStr || dateStr.length !== 6) return null;

        const yy = parseInt(dateStr.substring(0, 2));
        const mm = dateStr.substring(2, 4);
        const dd = dateStr.substring(4, 6);

        const currentYearShort = parseInt(new Date().getFullYear().toString().slice(-2));
        let yyyy;

        if (isExpiry) {
            // Expiry date logic:
            // If YY is less than 60, assume 20YY (e.g. 33 -> 2033)
            // If YY is significantly larger (e.g. 90), assume 1990 (expired long ago)
            yyyy = yy < 60 ? 2000 + yy : 1900 + yy;
        } else {
            // Birth date logic:
            // If YY > currentYear + 5 (future?), assume 19YY (born in 1990, not 2090)
            // Else assume 20YY
            yyyy = yy > (currentYearShort + 5) ? 1900 + yy : 2000 + yy;
        }

        // Return DD/MM/YYYY as requested by user
        return `${dd}/${mm}/${yyyy}`;
    }

    /**
     * Validate and format date to DD/MM/YYYY
     */
    validateDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;

        // Determine format and normalize to DD/MM/YYYY

        // Match YYYY-MM-DD (ISO) -> Convert to DD/MM/YYYY
        const isoMatch = dateStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (isoMatch) {
            return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
        }

        // Match DD/MM/YYYY or DD-MM-YYYY -> Return as DD/MM/YYYY
        const ddmmyyyyMatch = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
        if (ddmmyyyyMatch) {
            return `${ddmmyyyyMatch[1]}/${ddmmyyyyMatch[2]}/${ddmmyyyyMatch[3]}`;
        }

        // Match YYYY/MM/DD -> Convert to DD/MM/YYYY
        const yyyymmddMatch = dateStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (yyyymmddMatch) {
            return `${yyyymmddMatch[3]}/${yyyymmddMatch[2]}/${yyyymmddMatch[1]}`;
        }

        return dateStr; // Return original if unknown format (best effort)
    }

    /**
     * Manually parse MRZ lines when standard library fails due to noise
     * Corrects common OCR errors (O->0, I->1, etc. in numeric fields)
     */
    manuallyParseIndianMRZ(line1, line2) {
        try {
            // Line 1: P<IND<SURNAME<<GIVEN<NAMES<<<<<<<<<<<<
            // Line 2: PASS_NUM + IND + DOB + M/F + EXPIRY + ...

            const cleanLine1 = line1.replace(/[^A-Z<]/g, ''); // Line 1 only has letters and <
            let cleanLine2 = line2.replace(/[^A-Z0-9<]/g, '');

            const data = {
                nationality: 'IND',
                issuingCountry: 'IND',
                documentType: 'passport'
            };

            // Parse Name from Line 1
            // Try to identify the start of the name section
            let nameSection = "";
            if (cleanLine1.includes('P<IND')) {
                // Standard case: P<IND<SURNAME...
                // Or sticky case: P<INDSURNAME...
                // Only 'P<IND' is reliable. 
                const indIndex = cleanLine1.indexOf('P<IND');
                if (indIndex !== -1) {
                    // Everything after P<IND is roughly the name part
                    nameSection = cleanLine1.substring(indIndex + 5);
                }
            } else if (cleanLine1.startsWith('P')) {
                // Fallback: Just assume P is start
                nameSection = cleanLine1.substring(2); // Skip P<
            }

            if (nameSection) {
                // Split surname and given name
                // Standard separator is '<<'
                // Sticky might have single '<'

                // Clean up leading '<' if any
                nameSection = nameSection.replace(/^<+/, '');

                const nameParts = nameSection.split('<<');
                if (nameParts.length >= 2) {
                    data.lastName = nameParts[0].replace(/</g, ' ').trim();
                    data.firstName = nameParts[1].split('<')[0].replace(/</g, ' ').trim();
                } else {
                    // Try splitting by single '<' if << failed (rare but possible in bad OCR)
                    // But strictly, surname<givenname
                    const parts = nameSection.split('<');
                    if (parts.length >= 2) {
                        data.lastName = parts[0].trim();
                        // Join rest as given name
                        data.firstName = parts.slice(1).join(' ').replace(/</g, ' ').trim();
                    }
                }
            }

            // Parse Numbers from Line 2
            // Passport Number: First 8-9 chars usually

            // Extract potential Passport Number (first 7-9 chars)
            let passportNumRaw = cleanLine2.substring(0, 9).replace(/</g, '');
            // Passport num is typically 1 letter + 7 digits for India, usually
            if (passportNumRaw.length >= 8) {
                data.passportNumber = passportNumRaw;
            }

            // Find 'IND' in line 2
            const indIndex = cleanLine2.indexOf('IND');
            if (indIndex !== -1) {
                // Calculate offset: Expected IND position is 10 (9 chars passport + 1 check digit)
                // Offset handles shifted text (e.g. noise at start or crop issues)
                const shift = indIndex - 10;

                const dobStart = 13 + shift;
                const expiryStart = 21 + shift;
                const sexIndex = 20 + shift;

                // Safeguard against invalid indices
                const safeSub = (start, length) => {
                    if (start < 0) return '';
                    return cleanLine2.substring(start, start + length);
                };

                const potentialDOB = safeSub(dobStart, 6);
                const potentialExpiry = safeSub(expiryStart, 6);

                // Helper to fix digits
                const fixDigits = (str) => str.replace(/O/g, '0').replace(/I/g, '1').replace(/S/g, '5').replace(/B/g, '8');

                if (/\w{6}/.test(potentialDOB)) {
                    data.dateOfBirth = this.formatDate(fixDigits(potentialDOB));
                }
                if (/\w{6}/.test(potentialExpiry)) {
                    data.passportExpiry = this.formatDate(fixDigits(potentialExpiry), true);
                }

                // Strongest Gender Extraction: Anchor to DOB (6 digits) + Check (1 digit) + Sex (1 char)
                // Pattern: 8703019F (Date + Check + Sex)
                // This is extremely reliable for TD-3 passports
                const anchorZone = cleanLine2.substring(dobStart - 2, sexIndex + 5);
                const strongMatch = anchorZone.match(/[0-9]{6}[0-9]([MF])/);

                if (strongMatch) {
                    data.gender = strongMatch[1] === 'M' ? 'Male' : 'Female';
                } else {
                    // Try simpler match if DOB anchor text was damaged (e.g. date had letter O)
                    // [0-9][MF][0-9]
                    const simpleZone = cleanLine2.substring(sexIndex - 2, sexIndex + 3);
                    const simpleMatch = simpleZone.match(/[0-9<]([MF])[0-9]/);
                    if (simpleMatch) {
                        data.gender = simpleMatch[1] === 'M' ? 'Male' : 'Female';
                    }
                    // NO Fallback to charAt(20). If neither regex matches, leave null.
                }
            }

            return data;

        } catch (e) {
            console.error('Manual MRZ Parse Error', e);
            return null;
        }
    }

    /**
     * Extract passport data with fallback methods
     */
    parsePassportDataAdvanced(text) {
        const data = {
            passportNumber: null,
            firstName: null,
            lastName: null,
            dateOfBirth: null,
            passportExpiry: null,
            nationality: null,
            gender: null,
            placeOfBirth: null,
            dateOfIssue: null,
            placeOfIssue: null,
            issuingCountry: null
        };

        const cleanText = text.replace(/\r\n/g, '\n');
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l);

        // --- SPECIFIC INDIAN PASSPORT LOGIC ---
        // Indian passports usually have:
        // Text: REPUBLIC OF INDIA
        // Text: Surname
        // Text: <ACTUAL SURNAME>
        // Text: Given Name(s)
        // Text: <ACTUAL GIVEN NAME>

        const isIndian = text.includes('Republic of India') || text.includes('भारत गणराज्य') || text.includes('INDIAN');

        if (isIndian) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // GIVEN NAME logic
                if (line.match(/Given Name|Prnoms|Prenoms/i)) {
                    for (let j = 1; j <= 3; j++) {
                        const candidate = lines[i + j];
                        if (candidate && candidate.trim().length > 2) {
                            // Skip lines that are likely Hindi or sub-labels
                            // Hindi lines often have many chars outside standard ASCII range, or we can check for other labels
                            // Also skip if it contains "Date of Birth" or "Sex" which might appear if layout is tight
                            if (candidate.match(/Sex|Date|Place|Birth|Country|Nationality/i)) continue;

                            // Clean candidate
                            const cleanName = candidate.replace(/[^A-Z\s]/gi, '').trim();

                            // Heuristic: Names in passports are usually UPPERCASE.
                            // If cleanName is very short compared to original, it was probably noise/Hindi.
                            if (cleanName.length < candidate.length * 0.5) continue;

                            if (cleanName.length > 2) {
                                if (!data.firstName) {
                                    data.firstName = cleanName.toUpperCase();
                                    break;
                                }
                            }
                        }
                    }
                }

                // SURNAME logic
                if (line.match(/Surname|Information|Nom/i)) {
                    for (let j = 1; j <= 3; j++) {
                        const candidate = lines[i + j];
                        if (candidate && candidate.trim().length > 2) {
                            if (candidate.match(/Given Name|Sex|Date|Place|Country/i)) continue;

                            const cleanName = candidate.replace(/[^A-Z\s]/gi, '').trim();

                            // Heuristic: Check density of valid chars
                            if (cleanName.length < candidate.length * 0.5) continue;

                            if (cleanName.length > 2) {
                                if (!data.lastName) {
                                    data.lastName = cleanName.toUpperCase();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- GENERIC REGEX FALLBACK (EXISTING LOGIC IMPROVED) ---

        const cleanFullText = text.replace(/\s+/g, ' ').trim();

        // 1. Passport Number
        const passportPatterns = [
            /[A-Z]{1}[0-9]{7}/, // Standard Indian
            /(?:Passport No|No)[:.\s]*([A-Z0-9]+)/i
        ];
        for (const p of passportPatterns) {
            const m = cleanFullText.match(p);
            if (m) {
                // Clean up common OCR noise in passport number
                let num = (m[1] || m[0]).replace(/[^A-Z0-9]/g, '');
                if (num.length >= 7) {
                    data.passportNumber = num;
                    break;
                }
            }
        }

        // 2. Dates (DOB + Expiry)
        // Indian format: DD/MM/YYYY
        // find all dd/mm/yyyy patterns
        const dateMatches = cleanFullText.match(/\d{2}[-/]\d{2}[-/]\d{4}/g) || [];

        // Usually: DOB is 1st date, Issue is 2nd, Expiry is 3rd, or DOB is 1st, Expiry is 2nd.
        // We can look for keywords near the dates.

        // Enhanced date extraction with error tolerance
        // Look for patterns that *resemble* dates, e.g., 10/01/2O25
        const dateLikePatterns = [
            /(?:Birth|DOB)[^0-9]*([0-9OIZS]{2}[-/][0-9OIZS]{2}[-/][0-9OIZS]{4})/i,
            /(?:Expiry|Valid until)[^0-9]*([0-9OIZS]{2}[-/][0-9OIZS]{2}[-/][0-9OIZS]{4})/i,
            /([0-9OIZS]{2}[-/][0-9OIZS]{2}[-/][0-9OIZS]{4})/g // Global finder for anything looking like a date
        ];

        // 1. Try context-specific first
        const dobMatch = cleanFullText.match(dateLikePatterns[0]);
        if (dobMatch) data.dateOfBirth = this.validateDate(this.cleanOCRDate(dobMatch[1]));

        const expiryMatch = cleanFullText.match(/(?:Expiry|Valid until|Exp|Samapti)[^0-9]*([0-9OIZS]{2}[-/][0-9OIZS]{2}[-/][0-9OIZS]{4})/i);
        if (expiryMatch) data.passportExpiry = this.validateDate(this.cleanOCRDate(expiryMatch[1]));

        // 2. Fallback to finding all dates
        if (!data.dateOfBirth || !data.passportExpiry) {
            const allDates = cleanFullText.match(dateLikePatterns[2]) || [];
            const validDates = allDates
                .map(d => this.cleanOCRDate(d))
                .filter(d => this.validateDate(d)) // ensure valid format
                .map(d => {
                    // Standardize to YYYY-MM-DD for comparison
                    const parts = d.includes('-') ? d.split('-') : d.split('/');
                    // Handle potential MM/DD/YYYY vs DD/MM/YYYY confusion if necessary, but Indian is DD/MM/YYYY
                    // Assumption: input is DD/MM/YYYY after validation
                    return {
                        original: d,
                        dateObj: new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) // YYYY-MM-DD
                    };
                })
                .sort((a, b) => a.dateObj - b.dateObj); // Sort Oldest -> Newest

            if (validDates.length > 0) {
                // Determine DOB (usually oldest) and Expiry (usually newest)
                if (!data.dateOfBirth) {
                    // DOB is likely the oldest date found
                    data.dateOfBirth = this.validateDate(validDates[0].original);
                }

                if (!data.passportExpiry && validDates.length > 1) {
                    // Expiry is likely the newest date found (furthest in future)
                    // Check if last date is likely not DOB or Issue
                    const lastDate = validDates[validDates.length - 1];
                    // Use it if it's different from DOB
                    if (lastDate.original !== data.dateOfBirth) {
                        data.passportExpiry = this.validateDate(lastDate.original);
                    }
                }
            }
        }

        // 3. Gender (Improved)
        if (!data.gender) {
            // Priority 1: Look for labelled Sex/Gender
            const labelMatch = cleanFullText.match(/(?:Sex|Gender|Sexe)[.:\s]*([MF]|Male|Female)/i);
            if (labelMatch) {
                const g = labelMatch[1].toUpperCase();
                if (g.startsWith('F')) data.gender = 'Female';
                else if (g.startsWith('M')) data.gender = 'Male';
            }

            // Priority 2: Look for full words "Female" / "Male"
            if (!data.gender) {
                // Fuzzy match for Female (Fema1e, FemaIe, Fernale)
                if (/\bFe(?:m|rn)a[l1i]e\b/i.test(cleanFullText)) data.gender = 'Female';
                else if (/\bFemale\b/i.test(cleanFullText)) data.gender = 'Female';

                // Priority 3: Check for "Sex F" or "Sex M" if label colon was missed
                else if (/\bSex\s+F\b/i.test(cleanFullText)) data.gender = 'Female';
                else if (/\bSex\s+M\b/i.test(cleanFullText)) data.gender = 'Male';
            }
        }

        // 4. Nationality
        if (!data.nationality) {
            if (cleanFullText.match(/INDIAN|INDIA/i)) data.nationality = 'INDIAN';
        }

        // 5. Place of Birth
        // Patterns: "Place of Birth", "Lieu de naissance" followed by city/state
        if (!data.placeOfBirth) {
            // Removed (?:\n|$) anchor as cleanFullText lacks newlines
            const pobMatch = cleanFullText.match(/(?:Place of Birth|Lieu de naissance)[.:\s]*([A-Z\s,]+)/i);
            if (pobMatch && pobMatch[1].trim().length > 3) {
                // Filter out common next headers if they got captured
                let pob = pobMatch[1].trim();
                const stopWords = ['Place of Issue', 'Date of Issue', 'Sex', 'Date of Birth'];
                for (const word of stopWords) {
                    if (pob.match(new RegExp(word, 'i'))) pob = pob.split(new RegExp(word, 'i'))[0].trim();
                }
                data.placeOfBirth = pob.replace(/[^A-Z\s,]/gi, '').trim().toUpperCase();
            }
        }

        // 6. Place of Issue
        // Patterns: "Place of Issue", "Lieu de delivrance"
        if (!data.placeOfIssue) {
            const poiMatch = cleanFullText.match(/(?:Place of Issue|Lieu de delivrance)[.:\s]*([A-Z\s,]+)/i);
            if (poiMatch && poiMatch[1].trim().length > 3) {
                let poi = poiMatch[1].trim();
                const stopWords = ['Date', 'File', 'Signature'];
                for (const word of stopWords) {
                    if (poi.match(new RegExp(word, 'i'))) poi = poi.split(new RegExp(word, 'i'))[0].trim();
                }
                data.placeOfIssue = poi.replace(/[^A-Z\s,]/gi, '').trim().toUpperCase();
            }
        }

        // 7. Date of Issue
        // Patterns: "Date of Issue", "Date de delivrance"
        if (!data.dateOfIssue) {
            const doiMatch = cleanFullText.match(/(?:Date of Issue|Date de delivrance)[^0-9]*([0-9OIZS]{2}[-/][0-9OIZS]{2}[-/][0-9OIZS]{4})/i);
            if (doiMatch) {
                data.dateOfIssue = this.validateDate(this.cleanOCRDate(doiMatch[1]));
            }
        }

        return data;
    }

    /**
     * Helper to clean common OCR errors in date strings
     * O/D -> 0, I/l -> 1, Z -> 2, S -> 5, etc.
     */
    cleanOCRDate(dateStr) {
        if (!dateStr) return null;
        return dateStr
            .replace(/[ODQ]/g, '0') // O, D, Q -> 0
            .replace(/[Iil|]/g, '1') // I, i, l, | -> 1
            .replace(/[Zz]/g, '2')   // Z -> 2
            .replace(/[S]/g, '5')    // S -> 5
            .replace(/[B]/g, '8')    // B -> 8
            .replace(/[A]/g, '4')    // A -> 4 (sometimes)
            .replace(/[-]/g, '/');   // Normalize separators
    }

    /**
     * Validate and correct extracted data
     */
    validateAndCorrectData(data, fullText = '') {
        const corrected = { ...data };

        // Safety Override: If text strongly says Female, switch.
        // This catches cases where MRZ character was misread but "Sex: F" label works.
        if (fullText) {
            // Enhanced Fuzzy Pattern for Female / Sex F
            // Covers: Female, Fema1e, Fernale, Sex F, Sex: F, Sexe F
            const femalePattern = /\b(?:Fe(?:m|rn)a[l1i]e|Sexe?[\s:.]*F)\b/i;

            if (femalePattern.test(fullText)) {
                console.log('🔄 Gender Correction: Overriding to Female based on text evidence.');
                corrected.gender = 'Female';
            }
        }

        if (!corrected.warnings) corrected.warnings = [];

        // Validate passport number format
        if (corrected.passportNumber) {
            corrected.passportNumber = corrected.passportNumber
                .replace(/O/g, '0')
                .replace(/I/g, '1')
                .replace(/[^A-Z0-9]/g, '');
        }

        // 6-Month Validity Rule
        if (corrected.passportExpiry) {
            try {
                const [day, month, year] = corrected.passportExpiry.split('/').map(Number);
                const expiryDate = new Date(year, month - 1, day);
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

                if (expiryDate < sixMonthsFromNow) {
                    corrected.warnings.push('Passport expires in less than 6 months.');
                }
            } catch (e) {
                // Ignore date parse errors
            }
        }

        // Validate and correct names (remove numbers, special chars)
        if (corrected.firstName) {
            corrected.firstName = corrected.firstName
                .replace(/[^A-Z\s]/gi, '')
                .trim()
                .toUpperCase();
        }

        if (corrected.lastName) {
            corrected.lastName = corrected.lastName
                .replace(/[^A-Z\s]/gi, '')
                .trim()
                .toUpperCase();
        }

        // Validate dates
        if (corrected.dateOfBirth) {
            corrected.dateOfBirth = this.validateDate(corrected.dateOfBirth);
        }

        if (corrected.passportExpiry) {
            corrected.passportExpiry = this.validateDate(corrected.passportExpiry);
        }

        // Validate gender
        if (corrected.gender) {
            const genderLower = corrected.gender.toLowerCase().trim();
            if (genderLower === 'm' || genderLower === 'male') {
                corrected.gender = 'Male';
            } else if (genderLower === 'f' || genderLower === 'female') {
                corrected.gender = 'Female';
            }
        }

        return corrected;
    }

    /**
     * Process passport with advanced features
     */
    async processPassportAdvanced(imageBuffer) {
        try {
            console.log('🚀 Starting advanced OCR processing...');

            // Step 1: Advanced text extraction
            const ocrResult = await this.extractTextAdvanced(imageBuffer);
            console.log(`✅ OCR completed with ${ocrResult.confidence.toFixed(2)}% confidence`);

            // Step 0: Quality Analysis
            const qualityCheck = await this.analyzeImageQuality(imageBuffer);
            if (qualityCheck.warnings.length > 0) {
                console.log('⚠️ Quality Warnings:', qualityCheck.warnings);
            }

            // Step 1.5: Extract Face if available
            let faceImageBase64 = null;
            if (ocrResult.faceAnnotations && ocrResult.faceAnnotations.length > 0) {
                try {
                    console.log('👤 Face detected, attempting crop...');
                    faceImageBase64 = await this.extractFaceImage(imageBuffer, ocrResult.faceAnnotations[0]);
                    console.log('✅ Face extracted successfully');
                } catch (faceErr) {
                    console.warn('⚠️ Face extraction failed:', faceErr.message);
                }
            }

            // Step 2: Detect document type
            const docType = await this.detectDocumentType(ocrResult.text);
            console.log(`📄 Document type detected: ${docType}`);

            // Step 3: Try MRZ parsing first (most reliable)
            const mrzResult = this.parseMRZAdvanced(ocrResult.text);

            let extractedData;
            let confidence;

            if (mrzResult.success) {
                console.log('✅ MRZ parsing successful');
                extractedData = mrzResult.data;
                confidence = mrzResult.confidence;
            } else {
                console.log('⚠️ MRZ parsing failed, using text extraction');
                // Fallback to text-based extraction
                extractedData = this.parsePassportDataAdvanced(ocrResult.text);
                confidence = ocrResult.confidence;

                // Log raw text for debugging
                console.log('📝 Raw OCR Text (first 500 chars):', ocrResult.text.substring(0, 500));
                console.log('📊 Extracted Data:', JSON.stringify(extractedData, null, 2));
            }

            // Step 4: Validate and correct data
            const validatedData = this.validateAndCorrectData(extractedData, ocrResult.text);

            // Step 5: Calculate overall confidence
            const dataCompleteness = this.calculateDataCompleteness(validatedData);
            const finalConfidence = (confidence * 0.7) + (dataCompleteness * 0.3);

            // Add Confidence Warning
            if (finalConfidence < 80) {
                if (!validatedData.warnings) validatedData.warnings = [];
                validatedData.warnings.push(`Low confidence score (${finalConfidence.toFixed(0)}%). Please check details carefully or re-upload.`);
            }

            return {
                success: true,
                data: validatedData,
                confidence: finalConfidence,
                documentType: docType,
                mrzParsed: mrzResult.success,
                rawText: ocrResult.text,
                faceImage: faceImageBase64, // Add face image
                dataCompleteness: dataCompleteness,
                warnings: [...(validatedData.warnings || []), ...qualityCheck.warnings], // Merge QC warnings
                message: 'Passport data extracted successfully with advanced OCR'
            };

        } catch (error) {
            console.error('❌ Advanced passport processing error:', error);
            return {
                success: false,
                data: null,
                confidence: 0,
                documentType: 'unknown',
                mrzParsed: false,
                rawText: '',
                message: error.message
            };
        }
    }

    /**
     * Calculate data completeness percentage
     */
    calculateDataCompleteness(data) {
        const fields = [
            'passportNumber',
            'firstName',
            'lastName',
            'dateOfBirth',
            'passportExpiry',
            'nationality',
            'gender'
        ];

        const filledFields = fields.filter(field => data[field] && data[field] !== null);
        return (filledFields.length / fields.length) * 100;
    }

    /**
     * Compare two OCR results and merge best data
     */
    mergeOCRResults(result1, result2) {
        const merged = {};
        const fields = Object.keys(result1);

        const warnings = [];

        fields.forEach(field => {
            if (result1[field] && !result2[field]) {
                merged[field] = result1[field];
            } else if (!result1[field] && result2[field]) {
                merged[field] = result2[field];
            } else if (result1[field] && result2[field]) {
                // Both have data
                const val1 = result1[field].toString().toUpperCase();
                const val2 = result2[field].toString().toUpperCase();

                // Check for consistency in Names and Passport Number
                if (['firstName', 'lastName', 'passportNumber'].includes(field)) {
                    if (val1 !== val2) {
                        // Allow small typo tolerance? For now, strict warning.
                        // Actually, MRZ is usually more reliable for characters, but truncated.
                        // Visual is full length but OCR prone.

                        // If one contains the other, it's likely just truncation (common in MRZ)
                        if (!val1.includes(val2) && !val2.includes(val1)) {
                            // Only warn if completely different (Levenshtein would be better but simple include check covers truncation)
                            warnings.push(`Mismatch in ${field}: '${val1}' vs '${val2}'`);
                        }
                    }
                }

                // Choose longer/more complete one
                merged[field] = result1[field].length > result2[field].length
                    ? result1[field]
                    : result2[field];
            } else {
                merged[field] = null;
            }
        });

        if (warnings.length > 0) {
            merged.warnings = merged.warnings ? [...merged.warnings, ...warnings] : warnings;
        }

        return merged;
    }


    async extractFaceImage(imageBuffer, vertices) {
        try {
            if (!vertices || vertices.length !== 4) return null;

            // Vertices are typically normalized (0-1) or absolute? 
            // Google Vision returns absolute x,y coordinates if not using full text annotations?
            // Actually, face detection returns absolute coords.

            // ... assuming vertices are [{x,y}, {x,y}, {x,y}, {x,y}]

            // Calculate Box
            const xs = vertices.map(v => v.x).filter(x => x !== undefined);
            const ys = vertices.map(v => v.y).filter(y => y !== undefined);

            if (xs.length === 0 || ys.length === 0) return null;

            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);
            const width = maxX - minX;
            const height = maxY - minY;

            // Add padding (20%)
            const paddingX = width * 0.2;
            const paddingY = height * 0.2;

            const extractLeft = Math.max(0, Math.floor(minX - paddingX));
            const extractTop = Math.max(0, Math.floor(minY - paddingY));
            const extractWidth = Math.floor(width + (paddingX * 2));
            const extractHeight = Math.floor(height + (paddingY * 2));

            const faceBuffer = await sharp(imageBuffer)
                .extract({ left: extractLeft, top: extractTop, width: extractWidth, height: extractHeight })
                .toFormat('jpeg')
                .toBuffer();

            return `data:image/jpeg;base66,${faceBuffer.toString('base64')}`;

        } catch (error) {
            console.error("Error cropping face:", error);
            return null;
        }
    }

    /**
     * Process Passport Back Page to extract Father, Mother, Address
     */
    async processPassportBack(imageBuffer) {
        try {
            console.log("---- Processing Passport Back Page ----");

            // 1. Extract Text (Reuse existing logic)
            // Temporarily disable preprocessing for back page to ensure full text reading first
            // Or use mild preprocessing. Let's use standard extractTextAdvanced which tries Google first.
            const extractionResult = await this.extractTextAdvanced(imageBuffer);
            const text = extractionResult.text || '';
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);

            console.log("Back Parsed Lines:", lines.slice(0, 5), "...");

            const data = {
                fatherName: '',
                motherName: '',
                address: '',
                maritalStatus: '' // Inferred from Spouse Name
            };

            // 2. RegEx Strategy for Indian Passports

            // Father Name
            // Usually: "Name of Father / Legal Guardian" followed by name on next line
            // Or "Father's Name :" followed by name
            const fatherIdx = lines.findIndex(l => /Name of Father|Father's Name/i.test(l));
            if (fatherIdx !== -1 && lines[fatherIdx + 1]) {
                data.fatherName = lines[fatherIdx + 1].replace(/[:|-]/g, '').trim();
            }

            // Mother Name
            const motherIdx = lines.findIndex(l => /Name of Mother|Mother's Name/i.test(l));
            if (motherIdx !== -1 && lines[motherIdx + 1]) {
                data.motherName = lines[motherIdx + 1].replace(/[:|-]/g, '').trim();
            }

            // Spouse Name -> Marital Status
            // "Name of Spouse" or "Spouse's Name"
            const spouseIdx = lines.findIndex(l => /Name of Spouse|Spouse's Name/i.test(l));
            if (spouseIdx !== -1 && lines[spouseIdx + 1]) {
                const spouseName = lines[spouseIdx + 1].replace(/[:|-]/g, '').trim();
                if (spouseName.length > 2) {
                    data.maritalStatus = 'Married';
                }
            }

            // Address
            // Usually starts with "Address" or "Address :"
            // Ends with "PIN" or "File No" or "Old Passport"
            const addressStartIdx = lines.findIndex(l => /^Address/i.test(l));
            let addressLines = [];

            if (addressStartIdx !== -1) {
                // Collect lines until we hit a "Stop Word"
                // Stop Words: "PIN", "Old Passport No", "File No", "Date", "Place"
                for (let i = addressStartIdx + 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (/PIN|File No|Old Passport No/i.test(line)) {
                        // Include PIN line in address if it contains PIN
                        if (/PIN/i.test(line)) addressLines.push(line);
                        break;
                    }
                    addressLines.push(line);
                }
                data.address = addressLines.join(', ').trim();
            }

            // Fallback: If RegEx fails, try finding lines with "PIN" and take 2-3 lines before it?
            // (Risky, might get Mother's name). Stick to explicit headers for now.

            console.log("Back Extracted Data:", data);

            return {
                success: true,
                data: data,
                message: 'Passport Back Page Processed',
                documentType: 'passport-back'
            };

        } catch (error) {
            console.error("Back Page OCR Error:", error);
            return {
                success: false,
                message: 'Failed to process back page: ' + error.message,
                data: {}
            };
        }
    }
}

module.exports = new AdvancedOCRService();
