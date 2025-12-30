import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    X,
    Building2,
    CreditCard,
    User,
    Users,
    MapPin,
    FileCheck,
    Plus,
    Trash2
} from 'lucide-react';

const AgencyDocuments = () => {
    const { user } = useSelector(state => state.auth);
    const isApproved = user?.kycStatus === 'Approved';
    const isSubmitted = user?.kycStatus === 'Submitted';

    const [formData, setFormData] = useState({
        // Business Details
        agencyName: '',
        agencyType: '',
        panNumber: '',
        gstNumber: '',

        // Address (Mandatory)
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'India'
        },

        // Business Registration
        businessRegistration: {
            registrationNumber: '',
            registrationType: '',
            registrationDate: ''
        },

        // Bank Details
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: ''
        },

        // Directors (for companies)
        directors: []
    });

    const [documents, setDocuments] = useState({
        panCard: null,
        gstCertificate: null,
        businessRegistrationCertificate: null,
        ownerAadhar: null,
        ownerPhoto: null,
        ownerPan: null,
        tradeLicense: null,
        iataLicense: null,
        cancelledCheque: null,
        addressProof: null,
        addressProofType: 'Electricity Bill'
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState({});

    const agencyTypes = [
        'Travel Agency',
        'Freelancer',
        'Corporate',
        'Tour Operator',
        'Visa Consultant'
    ];

    const registrationTypes = [
        'Proprietorship',
        'Partnership',
        'Private Limited',
        'LLP',
        'Public Limited'
    ];

    const addressProofTypes = [
        'Electricity Bill',
        'Rent Agreement',
        'Property Tax Receipt',
        'Bank Statement'
    ];

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, docType) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [docType]: 'File size should not exceed 5MB' }));
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, [docType]: 'Only JPG, PNG, and PDF files are allowed' }));
                return;
            }

            setDocuments(prev => ({ ...prev, [docType]: file }));
            setErrors(prev => ({ ...prev, [docType]: null }));

            // Simulate upload progress
            simulateUpload(docType);
        }
    };

    const simulateUpload = (docType) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(prev => ({ ...prev, [docType]: progress }));
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    };

    const removeDocument = (docType) => {
        setDocuments(prev => ({ ...prev, [docType]: null }));
        setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
    };

    const addDirector = () => {
        setFormData(prev => ({
            ...prev,
            directors: [...prev.directors, {
                name: '',
                designation: '',
                aadhar: null,
                pan: null,
                photo: null
            }]
        }));
    };

    const removeDirector = (index) => {
        setFormData(prev => ({
            ...prev,
            directors: prev.directors.filter((_, i) => i !== index)
        }));
    };

    const handleDirectorChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            directors: prev.directors.map((dir, i) =>
                i === index ? { ...dir, [field]: value } : dir
            )
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Mandatory fields
        if (!formData.panNumber) newErrors.panNumber = 'PAN Number is mandatory';
        if (!formData.address.street) newErrors['address.street'] = 'Street address is mandatory';
        if (!formData.address.city) newErrors['address.city'] = 'City is mandatory';
        if (!formData.address.state) newErrors['address.state'] = 'State is mandatory';
        if (!formData.address.zip) newErrors['address.zip'] = 'ZIP code is mandatory';

        // Mandatory documents
        if (!documents.panCard) newErrors.panCard = 'PAN Card is mandatory';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Please fill all mandatory fields');
            return;
        }

        // Create FormData for file upload
        const submitData = new FormData();

        // Append text data
        submitData.append('agencyName', formData.agencyName);
        submitData.append('agencyType', formData.agencyType);
        submitData.append('panNumber', formData.panNumber);
        submitData.append('gstNumber', formData.gstNumber);
        submitData.append('address', JSON.stringify(formData.address));
        submitData.append('businessRegistration', JSON.stringify(formData.businessRegistration));
        submitData.append('bankDetails', JSON.stringify(formData.bankDetails));

        // Append documents
        Object.keys(documents).forEach(key => {
            if (documents[key] && documents[key] instanceof File) {
                submitData.append(key, documents[key]);
            }
        });

        try {
            // Use api utility - it handles base URL and Authorization automatically
            // Content-Type multipart/form-data is usually automatically set by axios when data is FormData,
            // but we can be explicit or let the utility handle it if it just passes config.

            // api.post wrapper usually handles headers. If we need to override/add specific headers:
            const response = await api.post('/users/profile/documents', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log('Submission success:', response.data);
            alert('Documents submitted successfully! Status: ' + response.data.kycStatus);

            // Ideally dispatch an update to auth slice here to update user.kycStatus in Redux
            window.location.reload(); // Simple refresh to fetch new user state for now

        } catch (error) {
            console.error('Error submitting documents:', error);
            alert(error.response?.data?.message || 'Failed to submit documents. Please try again.');
        }
    };

    const DocumentUploadCard = ({ title, docType, mandatory = false, icon: Icon }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                        <Icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        {mandatory && (
                            <span className="text-xs text-red-600 font-medium">* Mandatory</span>
                        )}
                    </div>
                </div>
                {documents[docType] && (
                    <button
                        onClick={() => removeDocument(docType)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {!documents[docType] ? (
                <label className="block">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF (max 5MB)</p>
                    </div>
                </label>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                            <FileText size={20} className="text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                {documents[docType].name}
                            </span>
                        </div>
                        {uploadProgress[docType] === 100 ? (
                            <CheckCircle size={20} className="text-green-600" />
                        ) : (
                            <span className="text-xs text-gray-500">{uploadProgress[docType]}%</span>
                        )}
                    </div>
                    {uploadProgress[docType] < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[docType]}%` }}
                            />
                        </div>
                    )}
                </div>
            )}

            {errors[docType] && (
                <div className="flex items-center mt-2 text-red-600 text-xs">
                    <AlertCircle size={14} className="mr-1" />
                    {errors[docType]}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className={`rounded-2xl p-8 text-white ${isApproved ? 'bg-green-600' : isSubmitted ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <h1 className="text-3xl font-bold mb-2">
                    {isApproved ? 'Agency Verified ✅' : isSubmitted ? 'Verification Pending ⏳' : 'Agency Document Upload'}
                </h1>
                <p className="text-blue-100">
                    {isApproved
                        ? 'Your agency is fully verified. You can now access all features.'
                        : isSubmitted
                            ? 'Your documents are under review. We will notify you once verified.'
                            : 'Complete your KYC by uploading all required documents'}
                </p>
                {!isApproved && !isSubmitted && (
                    <div className="mt-4 flex items-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                        <AlertCircle size={20} className="mr-2" />
                        <span className="text-sm">Fields marked with * are mandatory</span>
                    </div>
                )}
            </div>

            {isApproved ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verified</h2>
                    <p className="text-gray-500">Your documents have been approved by the admin.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={`space-y-8 ${isSubmitted ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Business Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <Building2 className="text-blue-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agency Name
                                </label>
                                <input
                                    type="text"
                                    name="agencyName"
                                    value={formData.agencyName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter agency name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agency Type
                                </label>
                                <select
                                    name="agencyType"
                                    value={formData.agencyType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select type</option>
                                    {agencyTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Number <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.panNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                />
                                {errors.panNumber && (
                                    <p className="text-red-600 text-xs mt-1">{errors.panNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST Number
                                </label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="22AAAAA0000A1Z5"
                                    maxLength={15}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <MapPin className="text-blue-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">
                                Address Information <span className="text-red-600">*</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Building name, street name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="City"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select state</option>
                                    {indianStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PIN Code <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address.zip"
                                    value={formData.address.zip}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors['address.zip'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="400001"
                                    maxLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Registration */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <FileCheck className="text-blue-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Business Registration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Type
                                </label>
                                <select
                                    name="businessRegistration.registrationType"
                                    value={formData.businessRegistration.registrationType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select type</option>
                                    {registrationTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Number
                                </label>
                                <input
                                    type="text"
                                    name="businessRegistration.registrationNumber"
                                    value={formData.businessRegistration.registrationNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Registration number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Date
                                </label>
                                <input
                                    type="date"
                                    name="businessRegistration.registrationDate"
                                    value={formData.businessRegistration.registrationDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <CreditCard className="text-blue-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Bank Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    name="bankDetails.accountHolderName"
                                    value={formData.bankDetails.accountHolderName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="As per bank records"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    name="bankDetails.accountNumber"
                                    value={formData.bankDetails.accountNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Account number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    name="bankDetails.ifscCode"
                                    value={formData.bankDetails.ifscCode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SBIN0001234"
                                    maxLength={11}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    name="bankDetails.bankName"
                                    value={formData.bankDetails.bankName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Bank name"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch Name
                                </label>
                                <input
                                    type="text"
                                    name="bankDetails.branchName"
                                    value={formData.bankDetails.branchName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Branch name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mandatory Documents */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Mandatory Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DocumentUploadCard
                                title="PAN Card"
                                docType="panCard"
                                mandatory={true}
                                icon={CreditCard}
                            />
                            <DocumentUploadCard
                                title="Owner Aadhar"
                                docType="ownerAadhar"
                                mandatory={false}
                                icon={User}
                            />
                            <DocumentUploadCard
                                title="Owner Photo"
                                docType="ownerPhoto"
                                mandatory={false}
                                icon={User}
                            />
                        </div>
                    </div>

                    {/* Business Documents */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Business Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DocumentUploadCard
                                title="GST Certificate"
                                docType="gstCertificate"
                                icon={FileText}
                            />
                            <DocumentUploadCard
                                title="Business Registration"
                                docType="businessRegistrationCertificate"
                                icon={Building2}
                            />
                            <DocumentUploadCard
                                title="Trade License"
                                docType="tradeLicense"
                                icon={FileCheck}
                            />
                            <DocumentUploadCard
                                title="IATA License"
                                docType="iataLicense"
                                icon={FileCheck}
                            />
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Proof Type
                                    </label>
                                    <select
                                        value={documents.addressProofType}
                                        onChange={(e) => setDocuments(prev => ({ ...prev, addressProofType: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {addressProofTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <DocumentUploadCard
                                    title="Address Proof"
                                    docType="addressProof"
                                    icon={MapPin}
                                />
                            </div>
                            <DocumentUploadCard
                                title="Cancelled Cheque"
                                docType="cancelledCheque"
                                icon={CreditCard}
                            />
                        </div>
                    </div>

                    {/* Director Documents */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Users className="text-blue-600 mr-3" size={24} />
                                <h2 className="text-xl font-bold text-gray-900">Director/Partner Documents</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addDirector}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Director
                            </button>
                        </div>

                        {formData.directors.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No directors added yet</p>
                                <p className="text-sm">Click "Add Director" to add director/partner details</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.directors.map((director, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-6 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeDirector(index)}
                                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <h3 className="font-semibold text-gray-900 mb-4">Director {index + 1}</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={director.name}
                                                onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Designation"
                                                value={director.designation}
                                                onChange={(e) => handleDirectorChange(index, 'designation', e.target.value)}
                                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar</label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleDirectorChange(index, 'aadhar', e.target.files[0])}
                                                    className="w-full text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">PAN</label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleDirectorChange(index, 'pan', e.target.files[0])}
                                                    className="w-full text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleDirectorChange(index, 'photo', e.target.files[0])}
                                                    className="w-full text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all"
                        >
                            Submit for Verification
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AgencyDocuments;
