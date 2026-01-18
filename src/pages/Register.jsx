import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload, AlertCircle, Shield, ChevronDown, Eye, EyeOff, Plane, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';
import { indianData } from '../utils/indianData';
import { countryCodes } from '../utils/countryCodes';
import { slugify } from '../utils/helpers';
import logo from '../assets/tripvenza_logo.png';

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
        addressProof: null,
        ownerPhoto: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const states = Object.keys(indianData);
    const cities = formData.state ? indianData[formData.state] || [] : [];

    const getPasswordStrength = (pass) => {
        if (!pass) return null;
        if (pass.length < 6) return { label: 'Weak', color: 'text-red-500' };

        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNum = /\d/.test(pass);
        const hasSpecial = /[\W_]/.test(pass);

        if (hasUpper && hasLower && hasNum && hasSpecial) {
            return { label: 'Strong', color: 'text-green-600' };
        }
        return { label: 'Medium', color: 'text-orange-500' };
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'state') {
            setFormData(prev => ({
                ...prev,
                state: value,
                city: ''
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
            const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError(`Invalid file type for ${fieldName}. Please upload JPG or PDF.`);
                return;
            }
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
        if (type === 'email' && !/\S+@\S+\.\S+/.test(identifier)) return setError('Invalid email format');
        if (type === 'phone' && formData.phone.length < 10) return setError('Invalid phone number');

        setLoading(true);
        try {
            const { data } = await api.post('/auth/send-otp', { identifier, type: type === 'phone' ? 'mobile' : 'email' });
            setOtpState(prev => ({ ...prev, [type + 'Sent']: true }));

            // For Dev/Demo: Alert the OTP if returned (Mobile/Mock)
            if (data.devOtp) {
                alert(`DEMO OTP for ${type}: ${data.devOtp}`);
            }

            setError('');
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
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all personal information fields.');
                return;
            }
            if (!otpState.emailVerified) { setError('Please verify your Email Address.'); return; }
            if (!otpState.phoneVerified) { setError('Please verify your Mobile Number.'); return; }
            if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
        }

        if (step === 2) {
            if (!formData.agencyName || !formData.agencyType || !formData.panNumber || !formData.street || !formData.state || !formData.city || !formData.zip) {
                setError('Please complete all business details.');
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

        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        if (!files.panCard || !files.aadhaarCard || !files.addressProof || !files.ownerPhoto) { setError('Please upload all mandatory documents'); return; }

        setLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'termsAccepted' && key !== 'countryCode') {
                    if (key !== 'street' && key !== 'city' && key !== 'state' && key !== 'zip' && key !== 'phone') {
                        submitData.append(key, formData[key]);
                    }
                }
            });
            submitData.append('phone', formData.countryCode + formData.phone);
            const address = { street: formData.street, city: formData.city, state: formData.state, zip: formData.zip, country: 'India' };
            submitData.append('address', JSON.stringify(address));

            if (files.panCard) submitData.append('panCard', files.panCard);
            if (files.aadhaarCard) submitData.append('aadhaarCard', files.aadhaarCard);
            if (files.gstCertificate) submitData.append('gstCertificate', files.gstCertificate);
            if (files.addressProof) submitData.append('addressProof', files.addressProof);
            if (files.ownerPhoto) submitData.append('ownerPhoto', files.ownerPhoto);

            const { data } = await api.post('/auth/register', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });

            dispatch(loginSuccess({ user: { ...data, walletBalance: 0 }, token: data.token }));
            navigate(`/${slugify(data.agencyName || data.name)}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Personal', icon: User },
        { id: 2, title: 'Business', icon: Building },
        { id: 3, title: 'Docs', icon: Shield },
        { id: 4, title: 'Review', icon: CheckCircle },
    ];

    const FileUploadField = ({ label, name, required = false, accept = ".jpg,.jpeg,.pdf", helpText }) => (
        <div className="border border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-colors bg-gray-50/50 group">
            <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {files[name] && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center font-medium">
                        <Check size={12} className="mr-1" /> Added
                    </span>
                )}
            </div>
            <input type="file" name={name} id={name} accept={accept} onChange={(e) => handleFileChange(e, name)} className="hidden" />

            <label htmlFor={name} className="cursor-pointer flex flex-col items-center justify-center py-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                <Upload className="text-blue-500 mb-2" size={20} />
                <span className="text-sm text-blue-600 font-medium">Click to upload document</span>
                <span className="text-xs text-gray-400 mt-1">{helpText || "JPG or PDF, Max 5MB"}</span>
            </label>

            {files[name] && (
                <div className=" mt-3 flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <FileText size={16} className="text-blue-600 mr-2" />
                    <p className="text-xs text-blue-900 truncate flex-1">{files[name].name}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex bg-gray-50/30 font-sans text-gray-900">
            {/* Left Sidebar - Progress */}
            <div className="hidden lg:flex lg:w-1/3 bg-blue-600 relative overflow-hidden flex-col p-12 justify-between text-white shadow-2xl z-10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 to-indigo-900/95"></div>

                {/* Decorative Circles */}
                <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <img
                            src={logo}
                            alt="TripVenza Logo"
                            className="h-16 w-auto object-contain bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-lg"
                        />
                    </div>

                    <h2 className="text-4xl font-bold mb-4 font-display leading-tight">Partner With Us</h2>
                    <p className="text-blue-100/80 text-base mb-12 max-w-xs leading-relaxed">Join thousands of travel agents growing with TripVenza. Create your account in 3 simple steps.</p>

                    <div className="space-y-0">
                        {steps.map((s, index) => (
                            <div key={s.id} className="relative pl-12 pb-10 last:pb-0">
                                {/* Connector Line */}
                                {index !== steps.length - 1 && (
                                    <div className={`absolute left-[19px] top-8 w-0.5 h-full -ml-px ${step > s.id ? 'bg-green-400' : 'bg-blue-800/50'}`}></div>
                                )}

                                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg
                                    ${step > s.id ? 'bg-green-500 border-green-500 text-white scale-100' :
                                        step === s.id ? 'bg-white text-blue-900 border-white scale-110' : 'border-blue-700/50 bg-blue-900/30 text-blue-300/50'}`}>
                                    {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                                </div>

                                <div>
                                    <h4 className={`font-bold text-base ${step === s.id ? 'text-white' : 'text-blue-300/70'}`}>{s.title}</h4>
                                    {step === s.id && <p className="text-xs text-blue-200 mt-1 animate-fade-in font-medium">Currently Editing</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-blue-200/50 font-medium tracking-wide">
                    © 2025 TripVenza Holidays. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-2/3 flex flex-col h-screen overflow-hidden bg-gray-50/30">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <span className="font-bold flex items-center gap-2 font-display text-lg">
                        <img src={logo} alt="TripVenza" className="h-8 w-auto" />
                    </span>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Step {step}/4</div>
                </div>
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode='wait'>
                                {/* STEP 1 */}
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-2">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 font-display">Personal Details</h2>
                                            <p className="text-gray-500 mt-2 text-base">Let's get to know you first.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm" placeholder="e.g. Hasmat Ali" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                                <div className="flex gap-3">
                                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} disabled={otpState.emailVerified}
                                                        className={`flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm ${otpState.emailVerified ? 'text-green-700 bg-green-50 border-green-200' : ''}`} placeholder="name@company.com" />
                                                    {!otpState.emailVerified && (
                                                        <button type="button" onClick={() => handleSendOtp('email')} disabled={!formData.email || otpState.emailSent}
                                                            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all hover:shadow-lg shadow-blue-600/20 whitespace-nowrap disabled:opacity-50 disabled:shadow-none">
                                                            {otpState.emailSent ? 'Verify OTP' : 'Send OTP'}
                                                        </button>
                                                    )}
                                                </div>
                                                {otpState.emailSent && !otpState.emailVerified && (
                                                    <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                        <input type="text" placeholder="Enter 6-digit OTP" value={otpState.emailOtp} onChange={(e) => setOtpState(prev => ({ ...prev, emailOtp: e.target.value }))} className="w-40 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" maxLength={6} />
                                                        <button type="button" onClick={() => handleVerifyOtp('email')} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 hover:shadow-lg shadow-green-600/20 transition-all">Verify</button>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                                <div className="flex gap-3">
                                                    <div className="relative w-32 shrink-0">
                                                        <div className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300/50 transition-colors shadow-sm" onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                                <img src={`https://flagcdn.com/w40/${selectedFlag.toLowerCase()}.png`} alt="flag" className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                                                                {formData.countryCode}
                                                            </span>
                                                            <ChevronDown size={14} className="text-gray-400" />
                                                        </div>
                                                        {showCountryDropdown && (
                                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl shadow-gray-200/50 rounded-xl z-30 max-h-60 overflow-y-auto border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                                {countryCodes.map((item) => (
                                                                    <div key={item.country} onClick={() => handleCountrySelect(item)} className="flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors">
                                                                        <span className="text-sm font-medium text-gray-700 flex-1">{item.name}</span>
                                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{item.code}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} disabled={otpState.phoneVerified}
                                                        className={`flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm ${otpState.phoneVerified ? 'text-green-700 bg-green-50 border-green-200' : ''}`} placeholder="98765 43210" />
                                                    {!otpState.phoneVerified && (
                                                        <button type="button" onClick={() => handleSendOtp('phone')} disabled={!formData.phone || otpState.phoneSent}
                                                            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all hover:shadow-lg shadow-blue-600/20 whitespace-nowrap disabled:opacity-50 disabled:shadow-none">
                                                            {otpState.phoneSent ? 'Verify OTP' : 'Send OTP'}
                                                        </button>
                                                    )}
                                                </div>
                                                {otpState.phoneSent && !otpState.phoneVerified && (
                                                    <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                        <input type="text" placeholder="Enter 6-digit OTP" value={otpState.phoneOtp} onChange={(e) => setOtpState(prev => ({ ...prev, phoneOtp: e.target.value }))} className="w-40 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" maxLength={6} />
                                                        <button type="button" onClick={() => handleVerifyOtp('phone')} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 hover:shadow-lg shadow-green-600/20 transition-all">Verify</button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                                    <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm" placeholder="••••••••" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm</label>
                                                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm" placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2 */}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-2">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 font-display">Business Details</h2>
                                            <p className="text-gray-500 mt-2 text-base">Tell us about your agency.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agency Name</label>
                                                    <input type="text" name="agencyName" required value={formData.agencyName} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm" placeholder="Global Travels" />
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agency Type</label>
                                                    <select name="agencyType" value={formData.agencyType} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium shadow-sm cursor-pointer">
                                                        <option>Travel Agency</option>
                                                        <option>Freelancer</option>
                                                        <option>Corporate</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number</label>
                                                    <input type="text" name="panNumber" required value={formData.panNumber} onChange={handleChange} maxLength={10}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm uppercase placeholder:normal-case" placeholder="ABCDE1234F" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">GST (Optional)</label>
                                                    <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm uppercase placeholder:normal-case" placeholder="GSTIN" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Office Address</label>
                                                <input type="text" name="street" required value={formData.street} onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium placeholder:text-gray-400 hover:border-blue-300/50 shadow-sm mb-4" placeholder="Street layout, Building" />

                                                <div className="grid grid-cols-3 gap-4">
                                                    <select name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm hover:border-blue-300/50 transition-all cursor-pointer">
                                                        <option value="">State</option>
                                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <select name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm hover:border-blue-300/50 transition-all cursor-pointer">
                                                        <option value="">City</option>
                                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                    <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium shadow-sm hover:border-blue-300/50 transition-all placeholder:text-gray-400" placeholder="ZIP Code" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3 */}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-2">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 font-display">Upload Documents</h2>
                                            <p className="text-gray-500 mt-2 text-base">Verify your business identity.</p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
                                            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                <Shield className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-blue-900">Secure Upload</h4>
                                                <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">Your documents are encrypted and stored safely. We ensure bank-grade security for your KYC verification.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FileUploadField label="Owner Photo" name="ownerPhoto" required helpText="Clear selfie/passport photo" />
                                                <FileUploadField label="PAN Card" name="panCard" required />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FileUploadField label="Aadhaar Card (Front/Back)" name="aadhaarCard" required helpText="Merged PDF or Front Image" />
                                                <FileUploadField label="Address Proof" name="addressProof" required helpText="Electricity Bill, Rent Deed etc." />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FileUploadField label="GST Cert (Optional)" name="gstCertificate" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep} className="px-6 py-3.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-xl transition-all hover:text-gray-900">
                                        Back
                                    </button>
                                ) : (
                                    <Link to="/login" className="px-6 py-3.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-xl transition-all hover:text-gray-900">
                                        Login Instead
                                    </Link>
                                )}

                                {step < 3 ? (
                                    <button type="button" onClick={nextStep} className="px-8 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center group">
                                        Continue <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} className="px-8 py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-0.5 flex items-center group">
                                        {loading ? 'Submitting...' : 'Submit Application'}
                                        {!loading && <CheckCircle size={18} className="ml-2 group-hover:scale-110 transition-transform" />}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
