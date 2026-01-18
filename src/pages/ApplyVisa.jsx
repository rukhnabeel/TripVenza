import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Shield, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import OCRUpload from '../components/OCRUpload';
import DocumentUploader from '../components/DocumentUploader';
import { indianStates } from '../data/indianStates';

const ApplyVisa = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { country, visa } = location.state || {}; // Expecting country and visa objects
    const [loading, setLoading] = useState(false);

    // Form State
    const [applicationType, setApplicationType] = useState('Individual'); // Individual or Group
    const [groupName, setGroupName] = useState('');
    const [internalId, setInternalId] = useState('');

    // Travelers State
    const [travelers, setTravelers] = useState([{
        id: Date.now(),
        isOpen: true, // For accordion behavior
        documents: { passportFront: '', passportBack: '', photo: '' },
        firstName: '', lastName: '', passportNumber: '',
        nationality: 'India', gender: '', dateOfBirth: '',
        placeOfBirth: '', placeOfIssue: '', dateOfIssue: '', passportExpiry: '',
        maritalStatus: '', fatherName: '', motherName: '',
        addressLine1: '', state: '', city: '', pinCode: ''
    }]);

    // Derived State
    const totalAmount = (visa?.totalFee || 0) * travelers.length;
    const canPay = (user?.walletBalance || 0) >= totalAmount;

    useEffect(() => {
        if (!country || !visa) {
            navigate('/dashboard/new-visa');
        }
        window.scrollTo(0, 0);
    }, [country, visa, navigate]);

    if (!country || !visa) return null;

    // Handlers
    const toggleTraveler = (index) => {
        const updated = [...travelers];
        updated[index].isOpen = !updated[index].isOpen;
        setTravelers(updated);
    };

    const updateTraveler = (index, field, value) => {
        const updated = [...travelers];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updated[index][parent][child] = value;
        } else {
            updated[index][field] = value;
        }
        setTravelers(updated);
    };

    const addTraveler = () => {
        setTravelers([...travelers, {
            id: Date.now(),
            isOpen: true,
            documents: { passportFront: '', passportBack: '', photo: '' },
            firstName: '', lastName: '', passportNumber: '',
            nationality: 'India', gender: '', dateOfBirth: '',
            placeOfBirth: '', placeOfIssue: '', dateOfIssue: '', passportExpiry: '',
            maritalStatus: '', fatherName: '', motherName: '',
            addressLine1: '', state: '', city: '', pinCode: ''
        }]);
    };

    const removeTraveler = (index) => {
        if (travelers.length > 1) {
            const updated = travelers.filter((_, i) => i !== index);
            setTravelers(updated);
        }
    };

    // OCR Handler
    const handleOCRData = (ocrResult, index) => {
        const extracted = ocrResult.data || ocrResult;
        const filePath = ocrResult.filePath;
        const updated = [...travelers];

        // Update Document Path
        if (filePath) {
            const type = ocrResult.documentType === 'passport-back' ? 'passportBack' : 'passportFront';
            updated[index].documents[type] = filePath;
        }
        if (extracted.faceImage || ocrResult.faceImage) {
            updated[index].documents.photo = extracted.faceImage || ocrResult.faceImage;
        }

        // Map Fields
        const map = {
            firstName: 'firstName', lastName: 'lastName', passportNumber: 'passportNumber',
            nationality: 'nationality', placeOfBirth: 'placeOfBirth', placeOfIssue: 'placeOfIssue',
            maritalStatus: 'maritalStatus', fatherName: 'fatherName', motherName: 'motherName'
        };

        Object.keys(map).forEach(k => {
            if (extracted[k]) updated[index][map[k]] = extracted[k];
        });

        // Date Normalization (DD/MM/YYYY)
        const fixDate = (d) => {
            if (!d) return '';
            const iso = d.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
            return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : d;
        };
        ['dateOfBirth', 'passportExpiry', 'dateOfIssue'].forEach(f => {
            if (extracted[f]) updated[index][f] = fixDate(extracted[f]);
        });

        if (extracted.gender) {
            const g = extracted.gender.toUpperCase();
            updated[index].gender = (g === 'M' || g === 'MALE') ? 'Male' : (g === 'F' || g === 'FEMALE') ? 'Female' : 'Other';
        }

        updated[index].isOpen = true; // Keep open to review
        setTravelers(updated);
    };

    const handleSubmit = async () => {
        // Basic Validation
        for (let i = 0; i < travelers.length; i++) {
            const t = travelers[i];
            if (!t.documents.passportFront || !t.documents.photo) {
                alert(`Traveler ${i + 1}: Please upload Passport Front and Photo.`);
                return;
            }
            if (!t.firstName || !t.passportNumber) {
                alert(`Traveler ${i + 1}: Please review personal details (Name, Passport No).`);
                return;
            }
        }

        if (!canPay) {
            alert("Insufficient wallet balance. Please add funds.");
            return;
        }

        setLoading(true);
        try {
            // Format dates for backend (YYYY-MM-DD)
            const formattedApplicants = travelers.map(app => {
                const toBackendDate = (d) => {
                    if (!d) return null;
                    const parts = d.split('/');
                    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
                };
                return {
                    ...app,
                    dateOfBirth: toBackendDate(app.dateOfBirth),
                    dateOfIssue: toBackendDate(app.dateOfIssue),
                    passportExpiry: toBackendDate(app.passportExpiry)
                };
            });

            const payload = {
                countryId: country._id,
                visaType: visa.type,
                applicants: formattedApplicants,
                totalInfos: { groupName, internalId, applicationType }
            };

            // Redirect to Payment/Processing logic (reusing existing payment flow or direct deduct)
            navigate('/dashboard/payment', {
                state: {
                    payload: payload,
                    countryName: country.name,
                    totalAmount: totalAmount
                }
            });

        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
            {/* Top Bar / Context */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase">Citizen of</span>
                            <span className="text-gray-900 font-bold">India</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase">Going to</span>
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                                {country.name} <ChevronDown size={14} />
                            </span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase">Visa Type</span>
                            <span className="text-gray-900 font-bold text-xs md:text-sm truncate max-w-[200px]">{visa.type}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - FORM */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Application Type */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Are You Applying For</h3>
                            <div className="flex gap-4">
                                {['Individual', 'Group'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setApplicationType(type)}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${applicationType === type
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Optional Group Fields */}
                            {applicationType === 'Group' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Internal ID</label>
                                        <input
                                            type="text"
                                            value={internalId}
                                            onChange={(e) => setInternalId(e.target.value)}
                                            className="w-full mt-1 p-3 bg-gray-50 rounded-lg text-sm font-medium border-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Group Name</label>
                                        <input
                                            type="text"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            className="w-full mt-1 p-3 bg-gray-50 rounded-lg text-sm font-medium border-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="Family Vacation etc."
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* TRAVELERS LIST */}
                        {travelers.map((traveler, index) => (
                            <div key={traveler.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                                {/* Accordion Header */}
                                <div
                                    onClick={() => toggleTraveler(index)}
                                    className={`px-6 py-4 flex justify-between items-center cursor-pointer ${traveler.isOpen ? 'bg-gray-50 border-b border-gray-100' : 'bg-white'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Traveler {index + 1}</h3>
                                            {!traveler.isOpen && traveler.firstName && (
                                                <p className="text-xs text-gray-500">{traveler.firstName} {traveler.lastName} - {traveler.passportNumber}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {travelers.length > 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); removeTraveler(index); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {traveler.isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Accordion Body */}
                                <AnimatePresence>
                                    {traveler.isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="p-6 space-y-8"
                                        >
                                            {/* Passport Upload Section */}
                                            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <Shield className="text-blue-600 w-5 h-5 mt-1 shrink-0" />
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">Upload Traveler's Front Passport Page</h4>
                                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                            Upload a clear passport image and <span className="font-bold text-blue-600">Drag & Drop</span> your details will be filled automatically.
                                                            OCR is 99.9% accurate. Review mandatory.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <OCRUpload
                                                        onDataExtracted={handleOCRData}
                                                        applicantIndex={index}
                                                        sampleSrc="/samples/sample_passport_front.png"
                                                    />
                                                    <OCRUpload
                                                        onDataExtracted={handleOCRData}
                                                        applicantIndex={index}
                                                        sampleSrc="/samples/sample_passport_back.png"
                                                        mode="back"
                                                        label="Passport Back (Optional)"
                                                    />
                                                </div>
                                            </div>

                                            {/* Form Fields - Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {[
                                                    { l: 'Passport Number', k: 'passportNumber' },
                                                    { l: 'First Name', k: 'firstName' },
                                                    { l: 'Last Name', k: 'lastName' },
                                                    { l: 'Nationality', k: 'nationality' },
                                                    { l: 'Sex', k: 'gender', type: 'select', opts: ['Male', 'Female', 'Other'] },
                                                    { l: 'Date of Birth', k: 'dateOfBirth' },
                                                    { l: 'Place of Birth', k: 'placeOfBirth' },
                                                    { l: 'Date of Issue', k: 'dateOfIssue' },
                                                    { l: 'Date of Expiry', k: 'passportExpiry' },
                                                    { l: 'Marital Status', k: 'maritalStatus', type: 'select', opts: ['Single', 'Married', 'Other'] },
                                                    { l: 'Father Name', k: 'fatherName' },
                                                    { l: 'Mother Name', k: 'motherName' },
                                                ].map((f, i) => (
                                                    <div key={i} className={f.full ? "col-span-full" : ""}>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{f.l}</label>
                                                        {f.type === 'select' ? (
                                                            <select
                                                                className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-200"
                                                                value={traveler[f.k]}
                                                                onChange={(e) => updateTraveler(index, f.k, e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
                                                                value={traveler[f.k]}
                                                                onChange={(e) => updateTraveler(index, f.k, e.target.value)}
                                                                placeholder={f.l}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Photo Upload */}
                                            <div className="border-t border-gray-100 pt-6">
                                                <h4 className="font-bold text-gray-900 mb-2">Upload Traveler Photo</h4>
                                                <p className="text-sm text-gray-500 mb-4">We will resize the photo for you as per specifications.</p>
                                                <DocumentUploader
                                                    documentType="photo"
                                                    initialPreview={traveler.documents.photo}
                                                    onUploadComplete={(path) => updateTraveler(index, 'documents.photo', path)}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        <button
                            onClick={addTraveler}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add Another Traveler
                        </button>
                    </div>

                    {/* RIGHT COLUMN - SUMMARY SIDEBAR */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Visa Info Card */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-black text-gray-900 text-lg">Review and Save</h3>
                                    <p className="text-sm text-gray-500 mt-1">{country.name} - {visa.type}</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Travelers</span>
                                        <span className="font-bold text-gray-900">{travelers.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Processing Time</span>
                                        <span className="font-bold text-green-600">{visa.processingTime}</span>
                                    </div>

                                    {/* Mock Dates */}
                                    {/* <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 font-medium flex gap-2">
                                        <Info size={14} className="mt-0.5" />
                                        Expected Approval: <span className="font-bold">Jan 20, 2026</span>
                                     </div> */}

                                    <div className="py-4 border-t border-b border-gray-100 space-y-3">
                                        <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Price Details</h4>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Visa Fee ({travelers.length} x ₹{visa.totalFee})</span>
                                            <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-black pt-2">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-blue-600">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Wallet Check */}
                                    <div className={`rounded-xl p-4 flex justify-between items-center ${canPay ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        <div>
                                            <p className="text-xs font-bold uppercase opacity-70">Wallet Balance</p>
                                            <p className="font-bold">₹{(user?.walletBalance || 0).toLocaleString()}</p>
                                        </div>
                                        {!canPay && <AlertCircle size={20} />}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !canPay}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${canPay ? 'bg-gray-900 hover:bg-blue-600 shadow-blue-900/20' : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {loading ? 'Processing...' : 'Review and Save'}
                                    </button>
                                </div>
                            </div>

                            {/* "Know Before You Pay" */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 text-sm">Know Before You Pay</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-sm text-gray-600">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                        <span><strong className="text-gray-900">Auto-validation:</strong> Using our OCR tech to check for common errors.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-600">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                        <span><strong className="text-gray-900">Instant Processing:</strong> Submitted to embassy within 30 seconds.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-600">
                                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                                        <span><strong className="text-gray-900">Non-refundable:</strong> Fees are paid to government immediately.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplyVisa;
