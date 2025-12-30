
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, User as UserIcon, FileText, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import OCRUpload from '../components/OCRUpload';
import DocumentUploader from '../components/DocumentUploader';
import SimpleUploader from '../components/SimpleUploader';
import { indianStates } from '../data/indianStates';

const ApplyVisa = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { country, visa } = location.state || {};

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
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Visa Selected</h2>
                <p className="text-gray-500 mb-6">Please select a country and visa type to proceed.</p>
                <button
                    onClick={() => navigate('/dashboard/new-visa')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Browse Visas
                </button>
            </div>
        );
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
        const isoMatch = dateStr.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
        if (isoMatch) {
            return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
        }
        return dateStr;
    };

    // Handle OCR extracted data
    const handleOCRData = (ocrResult, index) => {
        const extractedData = ocrResult.data || ocrResult;
        const filePath = ocrResult.filePath;
        const updated = [...applicants];

        if (filePath) {
            const documentType = ocrResult.documentType || 'passport';
            const isBackPage = documentType === 'passport-back';
            updated[index].documents = {
                ...updated[index].documents,
                [isBackPage ? 'passportBack' : 'passportFront']: filePath
            };
        }

        if (extractedData.faceImage || ocrResult.faceImage) {
            updated[index].documents.photo = extractedData.faceImage || ocrResult.faceImage;
        }

        // Map fields
        const fieldMap = {
            firstName: 'firstName', lastName: 'lastName', passportNumber: 'passportNumber',
            nationality: 'nationality', placeOfBirth: 'placeOfBirth', placeOfIssue: 'placeOfIssue',
            maritalStatus: 'maritalStatus', fatherName: 'fatherName', motherName: 'motherName',
            address: 'addressLine1' // Basic mapping for address
        };

        Object.keys(fieldMap).forEach(key => {
            if (extractedData[key]) updated[index][fieldMap[key]] = extractedData[key];
        });

        // Date fields
        if (extractedData.dateOfBirth) updated[index].dateOfBirth = normalizeDate(extractedData.dateOfBirth);
        if (extractedData.passportExpiry) updated[index].passportExpiry = normalizeDate(extractedData.passportExpiry);
        if (extractedData.dateOfIssue) updated[index].dateOfIssue = normalizeDate(extractedData.dateOfIssue);

        if (extractedData.gender) {
            const g = extractedData.gender.toUpperCase();
            updated[index].gender = (g === 'M' || g === 'MALE') ? 'Male' : (g === 'F' || g === 'FEMALE') ? 'Female' : 'Other';
        }

        setApplicants(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Applicants
        for (let i = 0; i < applicants.length; i++) {
            const app = applicants[i];
            const missingFields = [];
            const requiredFields = [
                { k: 'firstName', L: 'First Name' }, { k: 'lastName', L: 'Last Name' },
                { k: 'gender', L: 'Gender' }, { k: 'maritalStatus', L: 'Marital Status' },
                { k: 'nationality', L: 'Nationality' }, { k: 'dateOfBirth', L: 'Date of Birth' },
                { k: 'placeOfBirth', L: 'Place of Birth' },
                { k: 'passportNumber', L: 'Passport Number' }, { k: 'placeOfIssue', L: 'Place of Issue' },
                { k: 'dateOfIssue', L: 'Date of Issue' }, { k: 'passportExpiry', L: 'Passport Expiry' },
                { k: 'fatherName', L: "Father's Name" }, { k: 'motherName', L: "Mother's Name" },
                { k: 'addressLine1', L: 'Address Line 1' }, { k: 'state', L: 'State' },
                { k: 'city', L: 'City' }, { k: 'pinCode', L: 'PIN Code' }
            ];

            requiredFields.forEach(field => {
                if (!app[field.k]) missingFields.push(field.L);
            });

            const docs = app.documents;
            if (!docs.passportFront) missingFields.push('Passport Front');
            if (!docs.passportBack) missingFields.push('Passport Back');
            if (!docs.photo) missingFields.push('Applicant Photo');

            if (missingFields.length > 0) {
                alert(`Traveler #${i + 1} is missing details:\n- ${missingFields.join('\n- ')}`);
                return;
            }
        }

        const formattedApplicants = applicants.map(app => {
            const formatDateForBackend = (dateStr) => {
                if (!dateStr) return null;
                const parts = dateStr.split('/');
                if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                return dateStr;
            };

            return {
                ...app,
                dateOfBirth: formatDateForBackend(app.dateOfBirth),
                dateOfIssue: formatDateForBackend(app.dateOfIssue),
                passportExpiry: formatDateForBackend(app.passportExpiry)
            };
        });

        const payload = {
            countryId: country._id,
            visaType: visa.type,
            applicants: formattedApplicants,
            totalInfos: {}
        };

        navigate('/dashboard/payment', {
            state: {
                payload: payload,
                countryName: country.name,
                totalAmount: visa.totalFee * applicants.length
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-blue-600 font-medium flex items-center mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <img src={country.flag} alt={country.name} className="w-16 h-10 object-cover rounded shadow-sm border border-gray-100" />
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 font-display">{country.name} Valid Application</h1>
                            <p className="text-gray-500 font-medium flex items-center mt-1">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-bold mr-2">{visa.type}</span>
                                {applicants.length} Applicant{applicants.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-right relative z-10 bg-gray-50/80 p-4 rounded-2xl backdrop-blur-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-4xl font-black text-blue-600 font-display">₹{(visa.totalFee * applicants.length).toLocaleString()}</p>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <AnimatePresence mode="popLayout">
                    {applicants.map((applicant, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
                        >
                            {/* Applicant Header */}
                            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold mr-3 shadow-sm shadow-blue-200">
                                        {index + 1}
                                    </div>
                                    Traveler Details
                                </h3>
                                {applicants.length > 1 && (
                                    <button type="button" onClick={() => removeApplicant(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors flex items-center text-sm font-bold">
                                        <X size={16} className="mr-2" /> Remove
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {/* SECTION 1: Required Documents */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                                        <h4 className="text-lg font-bold text-gray-900">Required Documents</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Passport Front */}
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Passport Front</span>
                                                {applicant.documents.passportFront && <CheckCircle2 size={16} className="text-green-500" />}
                                            </div>
                                            <OCRUpload
                                                onDataExtracted={handleOCRData}
                                                applicantIndex={index}
                                                sampleSrc="/samples/sample_passport_front.png"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center">
                                                <AlertCircle size={10} className="mr-1" /> Auto-fills details
                                            </p>
                                        </div>

                                        {/* Passport Back */}
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Passport Back</span>
                                                {applicant.documents.passportBack && <CheckCircle2 size={16} className="text-green-500" />}
                                            </div>
                                            <OCRUpload
                                                onDataExtracted={handleOCRData}
                                                applicantIndex={index}
                                                sampleSrc="/samples/sample_passport_back.png"
                                                mode="back"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center">
                                                <AlertCircle size={10} className="mr-1" /> Auto-fills address
                                            </p>
                                        </div>

                                        {/* Photo */}
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant Photo</span>
                                                {applicant.documents.photo && <CheckCircle2 size={16} className="text-green-500" />}
                                            </div>
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
                                        </div>
                                    </div>

                                    {/* Optional/Extra Docs */}
                                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <SimpleUploader
                                            title="Passport Check"
                                            label="Passport Cover"
                                            maxSizeMB={2}
                                            onUploadComplete={(path) => {
                                                const updated = [...applicants];
                                                updated[index].documents.passportCover = path;
                                                setApplicants(updated);
                                            }}
                                        />
                                        <SimpleUploader
                                            title="Flight Tickets"
                                            label="Return Tickets"
                                            accept="application/pdf"
                                            allowedTypes={['application/pdf']}
                                            onUploadComplete={(path) => {
                                                const updated = [...applicants];
                                                updated[index].documents.tickets = path;
                                                setApplicants(updated);
                                            }}
                                        />
                                        <SimpleUploader
                                            title="Accommodation"
                                            label="Hotel Booking"
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

                                {/* SECTION 2: Personal Information */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                                        <h4 className="text-lg font-bold text-gray-900">Personal Information</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'First Name', field: 'firstName', placeholder: 'As on passport' },
                                            { label: 'Last Name', field: 'lastName', placeholder: 'Surname' },
                                            { label: 'Gender', field: 'gender', placeholder: 'Male / Female' },
                                            { label: 'Marital Status', field: 'maritalStatus', placeholder: 'Single / Married' },
                                            { label: 'Nationality', field: 'nationality', placeholder: 'e.g. Indian' },
                                            { label: 'Date of Birth', field: 'dateOfBirth', placeholder: 'DD/MM/YYYY' },
                                            { label: 'Place of Birth', field: 'placeOfBirth', placeholder: 'City / State' },
                                        ].map((item, i) => (
                                            <div key={i} className="group">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">{item.label}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
                                                    placeholder={item.placeholder}
                                                    value={applicant[item.field]}
                                                    onChange={(e) => handleApplicantChange(index, item.field, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-8 border-t border-gray-100"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Passport Number', field: 'passportNumber', placeholder: 'X1234567' },
                                            { label: 'Place of Issue', field: 'placeOfIssue', placeholder: 'City / Country' },
                                            { label: 'Date of Issue', field: 'dateOfIssue', placeholder: 'DD/MM/YYYY' },
                                            { label: 'Passport Expiry', field: 'passportExpiry', placeholder: 'DD/MM/YYYY' },
                                            { label: "Father's Name", field: 'fatherName', placeholder: 'Full Name' },
                                            { label: "Mother's Name", field: 'motherName', placeholder: 'Full Name' },
                                        ].map((item, i) => (
                                            <div key={i} className="group">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">{item.label}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
                                                    placeholder={item.placeholder}
                                                    value={applicant[item.field]}
                                                    onChange={(e) => handleApplicantChange(index, item.field, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>


                                    <div className="my-8 border-t border-gray-100"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address Line 1</label>
                                            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" value={applicant.addressLine1} onChange={(e) => handleApplicantChange(index, 'addressLine1', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address Line 2</label>
                                            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" value={applicant.addressLine2} onChange={(e) => handleApplicantChange(index, 'addressLine2', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                                value={applicant.state || ''}
                                                onChange={(e) => {
                                                    handleApplicantChange(index, 'state', e.target.value);
                                                    handleApplicantChange(index, 'city', '');
                                                }}
                                            >
                                                <option value="">Select State</option>
                                                {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City/District</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:opacity-50"
                                                value={applicant.city || ''}
                                                onChange={(e) => handleApplicantChange(index, 'city', e.target.value)}
                                                disabled={!applicant.state}
                                            >
                                                <option value="">{applicant.state ? 'Select District' : 'Select State First'}</option>
                                                {applicant.state && indianStates.find(s => s.name === applicant.state)?.districts.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                                            <input type="text" required maxLength="6" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" value={applicant.pinCode} onChange={(e) => handleApplicantChange(index, 'pinCode', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="flex justify-center">
                    <button type="button" onClick={addApplicant} className="flex items-center px-6 py-3 bg-white border border-gray-200 text-blue-600 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-all hover:scale-105">
                        <Plus size={20} className="mr-2" /> Add Another Traveler
                    </button>
                </div>

                {/* Sticky Action Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-2xl z-50 md:pl-72 lg:pl-80">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="hidden md:block">
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                            <p className="text-2xl font-black text-gray-900 font-display">₹{(visa.totalFee * applicants.length).toLocaleString()}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center transform active:scale-95"
                        >
                            {loading ? 'Processing...' : 'Pay & Submit Application'}
                            <ChevronRight size={20} className="ml-2" />
                        </button>
                    </div>
                </div>
                {/* Spacer for sticky footer */}
                <div className="h-24"></div>
            </form>
        </div>
    );
};

export default ApplyVisa;
