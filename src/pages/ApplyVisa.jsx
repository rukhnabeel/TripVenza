import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, User as UserIcon } from 'lucide-react';
import api from '../utils/api';
import OCRUpload from '../components/OCRUpload';
import DocumentUploader from '../components/DocumentUploader';
import SimpleUploader from '../components/SimpleUploader';
import { indianStates } from '../data/indianStates';

const ApplyVisa = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { country, visa } = location.state || {}; // Expecting state from NewVisa page

    const [applicants, setApplicants] = useState([{
        firstName: '', lastName: '', passportNumber: '',
        passportExpiry: '', dateOfBirth: '', nationality: '', gender: '',
        placeOfBirth: '', dateOfIssue: '', placeOfIssue: '',
        fatherName: '', motherName: '', maritalStatus: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        documents: { passportFront: '', passportBack: '', passportCover: '', tickets: '', hotel: '', photo: '' }
    }]);

    const [loading, setLoading] = useState(false);

    // Redirect if accessed directly without selection
    if (!country || !visa) {
        return <div className="p-8 text-center text-red-500">Please select a visa type first.</div>;
    }

    const handleApplicantChange = (index, field, value) => {
        const updated = [...applicants];
        updated[index][field] = value;
        setApplicants(updated);
    };

    const addApplicant = () => {
        setApplicants([...applicants, {
            firstName: '', lastName: '', passportNumber: '',
            passportExpiry: '', dateOfBirth: '', nationality: '', gender: '',
            placeOfBirth: '', dateOfIssue: '', placeOfIssue: '',
            fatherName: '', motherName: '', maritalStatus: '',
            addressLine1: '', addressLine2: '', city: '', state: '', pinCode: '',
            documents: { passportFront: '', passportBack: '', passportCover: '', tickets: '', hotel: '', photo: '' }
        }]);
    };

    const removeApplicant = (index) => {
        if (applicants.length > 1) {
            const updated = applicants.filter((_, i) => i !== index);
            setApplicants(updated);
        }
    };

    // Helper to ensure dates are consistent (DD/MM/YYYY)
    const normalizeDate = (dateStr) => {
        if (!dateStr) return '';

        // If YYYY-MM-DD (ISO), convert to DD/MM/YYYY
        const isoMatch = dateStr.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
        if (isoMatch) {
            return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
        }

        return dateStr;
    };

    // Handle OCR extracted data
    const handleOCRData = (ocrResult, index) => {
        console.log("Received OCR Result:", ocrResult);

        // Handle metadata and data extraction
        const extractedData = ocrResult.data || ocrResult;
        const filePath = ocrResult.filePath;

        const updated = [...applicants];

        // Store the file path in the correct field based on document type
        if (filePath) {
            const documentType = ocrResult.documentType || 'passport'; // 'passport-back' or 'passport'
            const isBackPage = documentType === 'passport-back';

            updated[index].documents = {
                ...updated[index].documents,
                [isBackPage ? 'passportBack' : 'passportFront']: filePath
            };
        }

        // Auto-fill extracted Face Image
        if (extractedData.faceImage || ocrResult.faceImage) {
            const faceImg = extractedData.faceImage || ocrResult.faceImage;
            console.log("📸 Auto-filling extracted face image");
            updated[index].documents = {
                ...updated[index].documents,
                photo: faceImg // Will be a base64 string
            };
        }

        // Auto-fill fields with OCR data
        if (extractedData.firstName) updated[index].firstName = extractedData.firstName;
        if (extractedData.lastName) updated[index].lastName = extractedData.lastName;
        if (extractedData.passportNumber) updated[index].passportNumber = extractedData.passportNumber;
        if (extractedData.dateOfBirth) updated[index].dateOfBirth = normalizeDate(extractedData.dateOfBirth);
        if (extractedData.passportExpiry) updated[index].passportExpiry = normalizeDate(extractedData.passportExpiry);
        if (extractedData.nationality) updated[index].nationality = extractedData.nationality;
        if (extractedData.gender) {
            const g = extractedData.gender.toUpperCase();
            updated[index].gender = (g === 'M' || g === 'MALE') ? 'Male' : (g === 'F' || g === 'FEMALE') ? 'Female' : 'Other';
        }

        // Advanced Fields
        if (extractedData.placeOfBirth) updated[index].placeOfBirth = extractedData.placeOfBirth;
        if (extractedData.dateOfIssue) updated[index].dateOfIssue = normalizeDate(extractedData.dateOfIssue);
        if (extractedData.placeOfIssue) updated[index].placeOfIssue = extractedData.placeOfIssue;
        if (extractedData.maritalStatus) updated[index].maritalStatus = extractedData.maritalStatus;

        // Back Page Fields (if extracted)
        if (extractedData.fatherName) updated[index].fatherName = extractedData.fatherName;
        if (extractedData.motherName) updated[index].motherName = extractedData.motherName;
        if (extractedData.address) updated[index].address = extractedData.address;

        setApplicants(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that all documents are uploaded
        for (let i = 0; i < applicants.length; i++) {
            const docs = applicants[i].documents;
            const missingDocs = [];
            if (!docs.passportFront) missingDocs.push('Passport Front');
            if (!docs.passportBack) missingDocs.push('Passport Back');
            if (!docs.photo) missingDocs.push('Applicant Photo');
            if (!docs.passportCover) missingDocs.push('Passport Cover');
            if (!docs.tickets) missingDocs.push('Round Trip Tickets');
            if (!docs.hotel) missingDocs.push('Hotel Booking');

            if (missingDocs.length > 0) {
                alert(`Please upload the following for Traveler #${i + 1}:\n- ${missingDocs.join('\n- ')}`);
                return;
            }
        }

        if (!window.confirm(`Confirm payment of ₹${visa.totalFee * applicants.length}?`)) return;

        setLoading(true);
        try {
            const payload = {
                countryId: country._id,
                visaType: visa.type,
                applicants: applicants,
                totalInfos: {} // Could add contact info here
            };

            const { data } = await api.post('/applications', payload);
            alert('Application Submitted Successfully!');
            navigate('/dashboard/applications');
        } catch (error) {
            alert(error.response?.data?.message || 'Submission Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Application for {country.name}</h1>
                    <p className="text-gray-500">{visa.type} • {applicants.length} Applicant(s)</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total payable</p>
                    <p className="text-3xl font-bold text-blue-600">₹{(visa.totalFee * applicants.length).toLocaleString()}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {applicants.map((applicant, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <UserIcon size={18} className="mr-2 text-blue-500" /> Traveler #{index + 1}
                            </h3>
                            {applicants.length > 1 && (
                                <button type="button" onClick={() => removeApplicant(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* SECTION 1: Required Documents */}
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                Required Documents
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Passport Front (OCR Trigger) */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Passport Front</span>
                                    <OCRUpload
                                        onDataExtracted={handleOCRData}
                                        applicantIndex={index}
                                        sampleSrc="/samples/sample_passport_front.png"
                                    />
                                    <p className="text-[10px] text-gray-400">Upload to auto-fill details</p>
                                </div>

                                {/* Passport Back (Now with OCR Trigger) */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Passport Back</span>
                                    <OCRUpload
                                        onDataExtracted={handleOCRData}
                                        applicantIndex={index}
                                        sampleSrc="/samples/sample_passport_back.png"
                                        mode="back" // Prop to signal back page processing
                                    />
                                    <p className="text-[10px] text-gray-400">Auto-fills Parents & Address</p>
                                </div>

                                {/* Applicant Photo */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Applicant Photo</span>
                                    <DocumentUploader
                                        title="Upload Photo"
                                        sampleSrc="/samples/sample_photo.png"
                                        initialPreview={applicant.documents.photo}
                                        documentType="photo"
                                        validateFace={true}
                                        onUploadComplete={(path) => {
                                            const updated = [...applicants];
                                            updated[index].documents.photo = path;
                                            setApplicants(updated);
                                        }}
                                    />
                                    <p className="text-[10px] text-gray-400">Must be a clear human face</p>
                                </div>
                            </div>

                            {/* Additional Documents (Cover, Tickets, Hotel) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
                                {/* Passport Cover */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Passport Cover</span>
                                    <SimpleUploader
                                        title="Cover Page"
                                        maxSizeMB={2}
                                        onUploadComplete={(path) => {
                                            const updated = [...applicants];
                                            updated[index].documents.passportCover = path;
                                            setApplicants(updated);
                                        }}
                                    />
                                </div>
                                {/* Tickets */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Round Trip Tickets</span>
                                    <SimpleUploader
                                        title="Flight Tickets"
                                        accept="application/pdf"
                                        allowedTypes={['application/pdf']}
                                        onUploadComplete={(path) => {
                                            const updated = [...applicants];
                                            updated[index].documents.tickets = path;
                                            setApplicants(updated);
                                        }}
                                    />
                                </div>
                                {/* Hotel */}
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Hotel Booking</span>
                                    <SimpleUploader
                                        title="Hotel Voucher"
                                        accept="application/pdf"
                                        allowedTypes={['application/pdf']}
                                        onUploadComplete={(path) => {
                                            const updated = [...applicants];
                                            updated[index].documents.hotel = path;
                                            setApplicants(updated);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Traveler Details */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                Traveler Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Personal Details */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">First Name</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.firstName} onChange={(e) => handleApplicantChange(index, 'firstName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Last Name</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.lastName} onChange={(e) => handleApplicantChange(index, 'lastName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Gender</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        placeholder="Male / Female"
                                        value={applicant.gender} onChange={(e) => handleApplicantChange(index, 'gender', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Marital Status</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        placeholder="Single / Married"
                                        value={applicant.maritalStatus} onChange={(e) => handleApplicantChange(index, 'maritalStatus', e.target.value)} />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Nationality</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.nationality} onChange={(e) => handleApplicantChange(index, 'nationality', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date of Birth</label>
                                    <input type="text" placeholder="DD/MM/YYYY" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.dateOfBirth} onChange={(e) => handleApplicantChange(index, 'dateOfBirth', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Place of Birth</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.placeOfBirth} onChange={(e) => handleApplicantChange(index, 'placeOfBirth', e.target.value)} />
                                </div>
                                <div>
                                    {/* Spacer or extra field if needed */}
                                    {/* Using hidden div to keep alignment if strictly needed, or just flow naturally */}
                                </div>

                                <div className="col-span-1 sm:col-span-2 lg:col-span-4 border-t border-gray-100 my-2 pt-2"></div>

                                {/* Passport Details */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Passport Number</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.passportNumber} onChange={(e) => handleApplicantChange(index, 'passportNumber', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Place of Issue</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.placeOfIssue} onChange={(e) => handleApplicantChange(index, 'placeOfIssue', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date of Issue</label>
                                    <input type="text" placeholder="DD/MM/YYYY" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.dateOfIssue} onChange={(e) => handleApplicantChange(index, 'dateOfIssue', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Passport Expiry</label>
                                    <input type="text" placeholder="DD/MM/YYYY" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.passportExpiry} onChange={(e) => handleApplicantChange(index, 'passportExpiry', e.target.value)} />
                                </div>

                                <div className="col-span-1 sm:col-span-2 lg:col-span-4 border-t border-gray-100 my-2 pt-2"></div>

                                {/* Family & Address */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Father's Name</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.fatherName} onChange={(e) => handleApplicantChange(index, 'fatherName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Mother's Name</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        value={applicant.motherName} onChange={(e) => handleApplicantChange(index, 'motherName', e.target.value)} />
                                </div>
                                <div className="hidden lg:block lg:col-span-2"></div>

                                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Address Line 1</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        placeholder="House No., Building Name"
                                        value={applicant.addressLine1 || ''} onChange={(e) => handleApplicantChange(index, 'addressLine1', e.target.value)} />
                                </div>
                                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Address Line 2</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        placeholder="Street, Area, Locality"
                                        value={applicant.addressLine2 || ''} onChange={(e) => handleApplicantChange(index, 'addressLine2', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                                    <select required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white cursor-pointer"
                                        value={applicant.state || ''}
                                        onChange={(e) => {
                                            handleApplicantChange(index, 'state', e.target.value);
                                            handleApplicantChange(index, 'city', ''); // Reset district
                                        }}>
                                        <option value="">Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state.name} value={state.name}>{state.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">City/District</label>
                                    <select required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white cursor-pointer"
                                        value={applicant.city || ''}
                                        onChange={(e) => handleApplicantChange(index, 'city', e.target.value)}
                                        disabled={!applicant.state}>
                                        <option value="">{applicant.state ? 'Select District' : 'Select State First'}</option>
                                        {applicant.state && indianStates.find(s => s.name === applicant.state)?.districts.map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">PIN Code</label>
                                    <input type="text" required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
                                        placeholder="6-digit PIN"
                                        maxLength="6"
                                        value={applicant.pinCode || ''} onChange={(e) => handleApplicantChange(index, 'pinCode', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between">
                    <button type="button" onClick={addApplicant} className="flex items-center text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg">
                        <Plus size={18} className="mr-2" /> Add Another Traveler
                    </button>

                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-transform hover:-translate-y-1">
                        {loading ? 'Processing...' : `Pay & Submit ₹${(visa.totalFee * applicants.length).toLocaleString()}`}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default ApplyVisa;
