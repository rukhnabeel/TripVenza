import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload, AlertCircle, Shield, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';
import { indianData } from '../utils/indianData';
import { countryCodes } from '../utils/countryCodes';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        password: '',
        confirmPassword: '',
        agencyName: '',
        agencyType: 'Travel Agency',
        gstNumber: '',
        panNumber: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        addressProofType: 'Shop Establishment Certificate / Registration Certificate',
        termsAccepted: false
    });

    // Valid ISO country code for flag display
    const [selectedFlag, setSelectedFlag] = useState('IN');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [files, setFiles] = useState({
        panCard: null,
        aadhaarCard: null,
        gstCertificate: null,
        addressProof: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const states = Object.keys(indianData);
    const cities = formData.state ? indianData[formData.state] || [] : [];

    const addressProofOptions = [
        'Shop Establishment Certificate / Registration Certificate',
        'Udyam Certificate (Along with Annexure Page)',
        'GST Certificate with Address Mentioned (All 3 Pages Mandatory)',
        'Electricity or Landline Bill (Not less than 3 months old)',
        'Rent Agreement'
    ];
    const getPasswordStrength = (pass) => {
        if (!pass) return null;
        if (pass.length < 6) return { label: 'Weak (Too short)', color: 'text-red-500' };

        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNum = /\d/.test(pass);
        const hasSpecial = /[\W_]/.test(pass);

        if (hasUpper && hasLower && hasNum && hasSpecial) {
            return { label: 'Strong Password', color: 'text-green-600' };
        }
        return { label: 'Medium (Add Uppercase, Number & Special)', color: 'text-yellow-600' };
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'state') {
            setFormData(prev => ({
                ...prev,
                state: value,
                city: '' // Reset city when state changes
            }));
        } else if (name === 'panNumber') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleCountrySelect = (item) => {
        setFormData(prev => ({ ...prev, countryCode: item.code }));
        setSelectedFlag(item.country);
        setShowCountryDropdown(false);
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type (JPG, PDF)
            const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError(`Invalid file type for ${fieldName}. Please upload JPG or PDF.`);
                return;
            }
            // Validate size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(`File too large for ${fieldName}. Max 5MB allowed.`);
                return;
            }

            setFiles(prev => ({ ...prev, [fieldName]: file }));
            setError('');
        }
    };

    const [otpState, setOtpState] = useState({
        emailSent: false,
        emailVerified: false,
        emailOtp: '',
        phoneSent: false,
        phoneVerified: false,
        phoneOtp: ''
    });

    const handleSendOtp = async (type) => {
        const identifier = type === 'email' ? formData.email : formData.countryCode + formData.phone;
        if (!identifier) return setError(`Please enter valid ${type}`);

        // Basic validation
        if (type === 'email' && !/\S+@\S+\.\S+/.test(identifier)) return setError('Invalid email format');
        if (type === 'phone' && formData.phone.length < 10) return setError('Invalid phone number');

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { identifier, type: type === 'phone' ? 'mobile' : 'email' });
            setOtpState(prev => ({ ...prev, [type + 'Sent']: true }));
            setError('');
            // Ensure error is cleared
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (type) => {
        const identifier = type === 'email' ? formData.email : formData.countryCode + formData.phone;
        const otp = type === 'email' ? otpState.emailOtp : otpState.phoneOtp;

        if (!otp || otp.length !== 6) return setError('Please enter valid 6-digit OTP');

        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { identifier, type: type === 'phone' ? 'mobile' : 'email', otp });
            setOtpState(prev => ({ ...prev, [type + 'Verified']: true, [type + 'Sent']: false }));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        // Validation for Step 1 (Personal Info)
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all personal information fields.');
                return;
            }
            if (!otpState.emailVerified) {
                setError('Please verify your Email Address before proceeding.');
                return;
            }
            if (!otpState.phoneVerified) {
                setError('Please verify your Mobile Number before proceeding.');
                return;
            }
            if (formData.name.length <= 2) {
                setError('Name must be at least 3 characters.');
                return;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                setError('Please enter a valid email address.');
                return;
            }
            if (formData.phone.length < 10) {
                setError('Phone number must be at least 10 digits.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            // Strict password complexity check
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(formData.password)) {
                setError('Password must contain uppercase, lowercase, number and special character (e.g. Pass@123).');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        // Validation for Step 2 (Business Info)
        if (step === 2) {
            if (!formData.agencyName) { setError("Agency Name is required"); return; }
            if (formData.agencyName.length < 3) { setError("Agency Name must be at least 3 characters"); return; }
            if (!/^[a-zA-Z0-9\s&.,_-]+$/.test(formData.agencyName)) { setError("Agency Name contains invalid characters"); return; }

            if (!formData.agencyType) { setError("Agency Type is required"); return; }
            if (!formData.panNumber) { setError("PAN Number is required"); return; }
            if (!formData.street) { setError("Street Address is required"); return; }
            if (!formData.state) { setError("State selection is required"); return; }
            if (!formData.city) { setError("City selection is required"); return; }
            if (!formData.zip) { setError("ZIP Code is required"); return; }

            if (formData.panNumber.length !== 10) {
                setError('PAN Number must be exactly 10 characters.');
                return;
            }
        }

        setStep(prev => prev + 1);
        setError('');
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!files.panCard) {
            setError('PAN Card is mandatory for ID Proof');
            return;
        }
        if (!files.aadhaarCard) {
            setError('Latest Aadhaar Card (with QR) is mandatory for ID Proof');
            return;
        }
        if (!files.addressProof) {
            setError('Address Proof document is mandatory');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();

            // Append text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'termsAccepted' && key !== 'countryCode') {
                    if (key === 'street' || key === 'city' || key === 'state' || key === 'zip' || key === 'phone') {
                        // Will handle separately
                    } else {
                        submitData.append(key, formData[key]);
                    }
                }
            });

            // Handle Phone
            submitData.append('phone', formData.countryCode + formData.phone);

            // Append Address object
            const address = {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: 'India'
            };
            submitData.append('address', JSON.stringify(address));

            // Append Files
            if (files.panCard) submitData.append('panCard', files.panCard);
            if (files.aadhaarCard) submitData.append('aadhaarCard', files.aadhaarCard);
            if (files.gstCertificate) submitData.append('gstCertificate', files.gstCertificate);
            if (files.addressProof) submitData.append('addressProof', files.addressProof);

            const { data } = await api.post('/auth/register', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Auto login after registration
            dispatch(loginSuccess({
                user: {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    walletBalance: 0
                },
                token: data.token
            }));

            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Personal Info', icon: User },
        { id: 2, title: 'Business Info', icon: Building },
        { id: 3, title: 'Documents', icon: Shield },
        { id: 4, title: 'Review', icon: CheckCircle },
    ];

    const FileUploadField = ({ label, name, required = false, accept = ".jpg,.jpeg,.pdf", helpText }) => (
        <div className="border border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 transition-colors bg-gray-50/50">
            <div className="flex justify-between items-start mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {files[name] && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center">
                        <CheckCircle size={10} className="mr-0.5" /> Added
                    </span>
                )}
            </div>
            {helpText && <p className="text-[10px] text-gray-500 mb-2 leading-tight">{helpText}</p>}
            <input
                type="file"
                name={name}
                id={name}
                accept={accept}
                onChange={(e) => handleFileChange(e, name)}
                className="hidden"
            />
            <label htmlFor={name} className="cursor-pointer flex items-center justify-center py-2 space-x-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                <Upload className="text-blue-500" size={16} />
                <span className="text-xs text-blue-600 font-medium">Click to upload</span>
            </label>
            {files[name] && (
                <div className="flex items-center justify-between mt-2 px-1 bg-gray-50 p-1.5 rounded border border-gray-100">
                    <p className="text-[10px] text-gray-600 truncate max-w-[75%]">
                        {files[name].name}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.open(URL.createObjectURL(files[name]), '_blank')}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                        View
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[85vh]">

                {/* Sidebar / Progress */}
                <div className="bg-blue-600 p-6 md:w-1/3 text-white flex flex-col justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Partner Registration</h2>
                        <p className="text-blue-100 text-xs mb-6">Join the fastest growing B2B visa platform.</p>

                        <div className="space-y-5">
                            {steps.map((s) => (
                                <div key={s.id} className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                    ${step >= s.id ? 'bg-white text-blue-600 border-white' : 'border-blue-400 text-blue-100'}`}>
                                        {step > s.id ? <CheckCircle size={16} /> : <s.icon size={16} />}
                                    </div>
                                    <span className={`font-medium text-sm ${step >= s.id ? 'text-white' : 'text-blue-200'}`}>
                                        {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-[10px] text-blue-200">Need help? Contact Support at <br /> support@tripvenza.com</p>
                    </div>
                </div>

                {/* Form Area - Scrollable */}
                <div className="p-6 md:w-2/3 md:overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode='wait'>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hasmat Ali" />
                                                {formData.name.length > 2 && (
                                                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                                            <div className="flex space-x-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        disabled={otpState.emailVerified || otpState.emailSent}
                                                        className={`w-full pl-3 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${otpState.emailVerified ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-300'}`}
                                                        placeholder="name@company.com"
                                                    />
                                                    {otpState.emailVerified && (
                                                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                    )}
                                                </div>
                                                {!otpState.emailVerified && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendOtp('email')}
                                                        disabled={!formData.email || otpState.emailSent}
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${otpState.emailSent ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                    >
                                                        {otpState.emailSent ? 'OTP Sent' : 'Verify Email'}
                                                    </button>
                                                )}
                                            </div>
                                            {otpState.emailSent && !otpState.emailVerified && (
                                                <div className="mt-2 flex space-x-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Email OTP"
                                                        value={otpState.emailOtp}
                                                        onChange={(e) => setOtpState(prev => ({ ...prev, emailOtp: e.target.value }))}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        maxLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyOtp('email')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendOtp('email')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Resend
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Custom Phone Input with Verify */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                            <div className="flex space-x-2">
                                                <div className="relative flex flex-1">
                                                    {/* Custom Dropdown Trigger */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                        disabled={otpState.phoneVerified || otpState.phoneSent}
                                                        className="flex items-center space-x-1 pl-2 pr-1 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors w-28 disabled:opacity-70"
                                                    >
                                                        <img
                                                            src={`https://flagcdn.com/w40/${selectedFlag.toLowerCase()}.png`}
                                                            alt="flag"
                                                            className="w-6 h-auto rounded-sm object-cover border border-gray-200"
                                                        />
                                                        <span className="text-sm text-gray-700 font-medium ml-1">{formData.countryCode}</span>
                                                        <ChevronDown size={14} className="text-gray-500 ml-auto" />
                                                    </button>

                                                    {/* Custom Dropdown List */}
                                                    {showCountryDropdown && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setShowCountryDropdown(false)}></div>
                                                            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                                                {countryCodes.map((item) => (
                                                                    <button
                                                                        key={item.country}
                                                                        type="button"
                                                                        onClick={() => handleCountrySelect(item)}
                                                                        className="flex items-center w-full px-4 py-2 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0"
                                                                    >
                                                                        <img
                                                                            src={`https://flagcdn.com/w40/${item.country.toLowerCase()}.png`}
                                                                            alt={item.name}
                                                                            className="w-6 h-auto mr-3 rounded-sm border border-gray-100"
                                                                        />
                                                                        <span className="text-sm text-gray-700 font-medium truncate flex-1">{item.name}</span>
                                                                        <span className="text-xs text-gray-500 ml-2 font-mono whitespace-nowrap">{item.code}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        required
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        disabled={otpState.phoneVerified || otpState.phoneSent}
                                                        className={`w-full pl-3 pr-10 py-2 border rounded-r-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${otpState.phoneVerified ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-300'}`}
                                                        placeholder="98765 43210"
                                                    />
                                                    {otpState.phoneVerified && (
                                                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                    )}
                                                </div>

                                                {!otpState.phoneVerified && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendOtp('phone')}
                                                        disabled={!formData.phone || otpState.phoneSent}
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${otpState.phoneSent ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                    >
                                                        {otpState.phoneSent ? 'OTP Sent' : 'Verify Phone'}
                                                    </button>
                                                )}
                                            </div>

                                            {otpState.phoneSent && !otpState.phoneVerified && (
                                                <div className="mt-2 flex space-x-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Phone OTP"
                                                        value={otpState.phoneOtp}
                                                        onChange={(e) => setOtpState(prev => ({ ...prev, phoneOtp: e.target.value }))}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        maxLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyOtp('phone')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendOtp('phone')}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Resend
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        required
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {formData.password && (
                                                    <div className={`text-xs mt-1 flex items-center ${getPasswordStrength(formData.password).color}`}>
                                                        {getPasswordStrength(formData.password).label === 'Strong Password' && <CheckCircle size={12} className="mr-1" />}
                                                        {getPasswordStrength(formData.password).label}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        required
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                                                    <div className="text-xs text-green-600 mt-1 flex items-center">
                                                        <CheckCircle size={12} className="mr-1" /> Match
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {error && <div className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
                                    <div className="flex justify-end mt-6">
                                        <button type="button" onClick={nextStep} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Next Step <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Details</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Agency Name <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input type="text" name="agencyName" required value={formData.agencyName} onChange={handleChange}
                                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Global Travels" />
                                                {formData.agencyName.length > 2 && (
                                                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Agency Type</label>
                                            <select name="agencyType" value={formData.agencyType} onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option>Travel Agency</option>
                                                <option>Freelancer</option>
                                                <option>Corporate</option>
                                                <option>Tour Operator</option>
                                                <option>Visa Consultant</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input type="text" name="panNumber" required value={formData.panNumber} onChange={handleChange}
                                                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ABCDE1234F" maxLength={10} />
                                                    {formData.panNumber.length === 10 && (
                                                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                                                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GST Number" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Office Address <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input type="text" name="street" required value={formData.street} onChange={handleChange}
                                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Street Address" />
                                                {formData.street.length > 5 && (
                                                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* State Dropdown */}
                                            <div className="relative">
                                                <select
                                                    name="state"
                                                    required
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white appearance-none"
                                                >
                                                    <option value="">State</option>
                                                    {states.map(state => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* City Dropdown - Dependent on State */}
                                            <div className="relative">
                                                <select
                                                    name="city"
                                                    required
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white appearance-none"
                                                    disabled={!formData.state}
                                                >
                                                    <option value="">City</option>
                                                    {cities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="relative">
                                                <input type="text" name="zip" required value={formData.zip} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="ZIP" />
                                                {formData.zip.length >= 6 && (
                                                    <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" size={14} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {error && <div className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
                                    <div className="flex justify-between mt-6">
                                        <button type="button" onClick={prevStep} className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                                            <ArrowLeft size={16} className="mr-2" /> Back
                                        </button>
                                        <button type="button" onClick={nextStep} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Next Step <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Document Upload</h3>
                                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                        <div className="flex items-start">
                                            <AlertCircle size={18} className="text-blue-600 mr-2 mt-0.5" />
                                            <p className="text-xs text-blue-800">Clear copies needed. JPG/PDF, Max 5MB.</p>
                                        </div>
                                    </div>

                                    {/* ID Proof Section */}
                                    <div className="border border-gray-200 rounded-xl p-4 mb-4">
                                        <h4 className="font-medium text-gray-900 mb-3 text-sm flex items-center">
                                            <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded text-[10px] uppercase font-bold mr-2">Mandatory</span>
                                            ID Proof
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <FileUploadField
                                                label="PAN Card"
                                                name="panCard"
                                                required={true}
                                            />
                                            <FileUploadField
                                                label="ID Proof (Aadhar QR)"
                                                name="aadhaarCard"
                                                required={true}
                                                helpText="Must have QR code"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Proof Section */}
                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <h4 className="font-medium text-gray-900 mb-3 text-sm flex items-center">
                                            <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded text-[10px] uppercase font-bold mr-2">Mandatory</span>
                                            Address Proof
                                        </h4>
                                        <select
                                            name="addressProofType"
                                            value={formData.addressProofType}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                                        >
                                            {addressProofOptions.map((opt, idx) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>

                                        <FileUploadField
                                            label="Address Proof Document"
                                            name="addressProof"
                                            required={true}
                                            helpText={formData.addressProofType.includes('All 3 Pages') ? 'Upload all pages as single PDF' : ''}
                                        />
                                    </div>



                                    {error && <div className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

                                    <div className="flex justify-between mt-6">
                                        <button type="button" onClick={prevStep} className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                                            <ArrowLeft size={16} className="mr-2" /> Back
                                        </button>
                                        <button type="button" onClick={nextStep} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Next Step <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h3>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h4 className="font-semibold text-blue-800 text-sm mb-2">Summary</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li><strong>Agency:</strong> {formData.agencyName}</li>
                                            <li><strong>Email:</strong> {formData.email}</li>
                                            <li><strong>Phone:</strong> {formData.countryCode} {formData.phone}</li>
                                            <li><strong>Location:</strong> {formData.city}, {formData.state}</li>
                                            <li><strong>ID Proof:</strong> PAN & Aadhaar (Uploaded)</li>
                                            <li><strong>Address Proof:</strong> {formData.addressProofType}</li>
                                        </ul>
                                    </div>

                                    <div className="flex items-start space-x-3 mt-6">
                                        <input type="checkbox" name="termsAccepted" id="terms" checked={formData.termsAccepted} onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        <label htmlFor="terms" className="text-xs text-gray-600">
                                            I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                                        </label>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-8">
                                        <button type="button" onClick={prevStep} className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                                            <ArrowLeft size={16} className="mr-2" /> Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!formData.termsAccepted || loading}
                                            className={`flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md text-sm
                        ${(!formData.termsAccepted || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 hover:shadow-lg'} transition-all`}
                                        >
                                            {loading ? 'Creating Account...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-600">
                                Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in here</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
