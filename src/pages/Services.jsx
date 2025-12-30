import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, Globe, DollarSign, Clock, FileText, Image as ImageIcon, Briefcase, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Services = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedVisa, setSelectedVisa] = useState(null); // For editing visa

    // Form States
    const [countryForm, setCountryForm] = useState({ name: '', code: '', region: 'Asia', flag: '', description: '' });
    const [visaForm, setVisaForm] = useState({
        type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single',
        govtFee: 0, baseServiceFee: 0, totalFee: 0,
        tieredServiceFees: { silver: 0, gold: 0, platinum: 0 },
        documentsRequired: [], description: ''
    });

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const { data } = await api.get('/countries');
            setCountries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Country Handlers ---
    const handleSaveCountry = async () => {
        try {
            if (selectedCountry) {
                await api.put(`/countries/${selectedCountry._id}`, countryForm);
            } else {
                await api.post('/countries', countryForm);
            }
            setIsCountryModalOpen(false);
            fetchCountries();
            setCountryForm({ name: '', code: '', region: 'Asia', flag: '', description: '' });
            setSelectedCountry(null);
        } catch (error) {
            alert('Failed to save country');
        }
    };

    const handleDeleteCountry = async (id) => {
        if (window.confirm('Are you sure? This will delete all visas under this country.')) {
            try {
                await api.delete(`/countries/${id}`);
                fetchCountries();
            } catch (error) {
                alert('Failed to delete country');
            }
        }
    };

    const openCountryModal = (country = null) => {
        if (country) {
            setSelectedCountry(country);
            setCountryForm({ ...country });
        } else {
            setSelectedCountry(null);
            setCountryForm({ name: '', code: '', region: 'Asia', flag: '', description: '' });
        }
        setIsCountryModalOpen(true);
    };

    // --- Visa Handlers ---
    const handleSaveVisa = async () => {
        try {
            const payload = { ...visaForm, totalFee: Number(visaForm.govtFee) + Number(visaForm.baseServiceFee) };

            if (selectedVisa) {
                await api.put(`/countries/${selectedCountry._id}/visas/${selectedVisa._id}`, payload);
            } else {
                await api.post(`/countries/${selectedCountry._id}/visas`, payload);
            }
            setIsVisaModalOpen(false);
            fetchCountries(); // Refresh to show new visa nested in country
            setVisaForm({
                type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single',
                govtFee: 0, baseServiceFee: 0, totalFee: 0,
                tieredServiceFees: { silver: 0, gold: 0, platinum: 0 },
                documentsRequired: [], description: ''
            });
            setSelectedVisa(null);
        } catch (error) {
            alert('Failed to save visa type');
        }
    };

    const handleDeleteVisa = async (countryId, visaId) => {
        if (window.confirm('Delete this visa type?')) {
            try {
                await api.delete(`/countries/${countryId}/visas/${visaId}`);
                fetchCountries();
            } catch (error) {
                alert('Failed to delete visa');
            }
        }
    };

    const openVisaModal = (country, visa = null) => {
        setSelectedCountry(country);
        if (visa) {
            setSelectedVisa(visa);
            setVisaForm({ ...visa });
        } else {
            setSelectedVisa(null);
            setVisaForm({
                type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single',
                govtFee: 0, baseServiceFee: 0, totalFee: 0,
                tieredServiceFees: { silver: 0, gold: 0, platinum: 0 },
                documentsRequired: [], description: ''
            });
        }
        setIsVisaModalOpen(true);
    };

    const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Premium Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
            >
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                                <Globe size={24} className="text-blue-200" />
                            </div>
                            <h1 className="text-3xl font-bold font-display">Services Management</h1>
                        </div>
                        <p className="text-slate-300 max-w-lg text-sm font-medium">
                            Manage your portfolio of countries and visa products to offer to your network.
                        </p>
                    </div>
                    <button
                        onClick={() => openCountryModal()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center"
                    >
                        <Plus size={20} className="mr-2" /> Add Country
                    </button>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative max-w-2xl mx-auto group"
            >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search countries by name..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-8"
            >
                {filteredCountries.map(country => (
                    <motion.div
                        key={country._id}
                        variants={itemVariants}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                        {/* Country Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-white">
                                    {country.flag ? (
                                        <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            <Globe size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-2xl font-display">{country.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">{country.code}</span>
                                        <span className="text-xs text-gray-400 font-medium">• {country.region}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto">
                                <button onClick={() => openCountryModal(country)} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDeleteCountry(country._id)} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Visas Grid */}
                        <div className="p-6 bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase size={16} />
                                    Available Visa Products
                                </h4>
                                <button
                                    onClick={() => openVisaModal(country)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors flex items-center"
                                >
                                    <Plus size={14} className="mr-1.5" /> Add Visa
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {country.visaTypes?.map(visa => (
                                    <div key={visa._id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => openVisaModal(country, visa)} className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg border border-gray-200">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteVisa(country._id, visa._id)} className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg border border-gray-200">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        <h5 className="font-bold text-gray-900 text-lg mb-1 pr-12">{visa.type}</h5>
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8">{visa.description}</p>

                                        <div className="space-y-2 pt-4 border-t border-gray-50">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded text-xs">Processing</span>
                                                <span className="font-semibold text-gray-700">{visa.processingTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded text-xs">Fees</span>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 block">₹{visa.totalFee}</span>
                                                    <span className="text-[10px] text-green-600 font-medium">Earn ₹{visa.baseServiceFee}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!country.visaTypes || country.visaTypes.length === 0) && (
                                    <div
                                        onClick={() => openVisaModal(country)}
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer h-full min-h-[160px]"
                                    >
                                        <Plus size={32} className="mb-2 opacity-50" />
                                        <span className="text-sm font-bold">Add First Visa Product</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Country Modal - Refined */}
            <AnimatePresence>
                {isCountryModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold font-display">{selectedCountry ? 'Edit Country' : 'Add New Country'}</h2>
                                <button onClick={() => setIsCountryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Country Name</label>
                                    <input className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={countryForm.name} onChange={e => setCountryForm({ ...countryForm, name: e.target.value })} placeholder="e.g. United Arab Emirates" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">ISO Code</label>
                                        <input className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={countryForm.code} onChange={e => setCountryForm({ ...countryForm, code: e.target.value })} placeholder="AE" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Region</label>
                                        <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium bg-white" value={countryForm.region} onChange={e => setCountryForm({ ...countryForm, region: e.target.value })}>
                                            <option>Asia</option>
                                            <option>Europe</option>
                                            <option>Middle East</option>
                                            <option>Africa</option>
                                            <option>North America</option>
                                            <option>South America</option>
                                            <option>Oceania</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Flag URL</label>
                                    <div className="flex gap-3">
                                        <input className="flex-1 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={countryForm.flag} onChange={e => setCountryForm({ ...countryForm, flag: e.target.value })} placeholder="https://..." />
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            {countryForm.flag ? <img src={countryForm.flag} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                                    <textarea className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium min-h-[100px]" value={countryForm.description} onChange={e => setCountryForm({ ...countryForm, description: e.target.value })} placeholder="Brief description of the destination..." />
                                </div>
                                <button onClick={handleSaveCountry} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform active:scale-95">Save Country</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Visa Modal - Refined */}
            <AnimatePresence>
                {isVisaModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold font-display">{selectedVisa ? 'Edit Visa Product' : 'Create Visa Product'}</h2>
                                <button onClick={() => setIsVisaModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Visa Title</label>
                                    <input className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={visaForm.type} onChange={e => setVisaForm({ ...visaForm, type: e.target.value })} placeholder="e.g. 30 Days Tourist Visa" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Govt Fee (₹)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="number" className="w-full pl-9 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={visaForm.govtFee} onChange={e => setVisaForm({ ...visaForm, govtFee: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Base Service Fee (₹)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                                        <input type="number" className="w-full pl-9 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" value={visaForm.baseServiceFee} onChange={e => {
                                            setVisaForm({
                                                ...visaForm,
                                                baseServiceFee: e.target.value,
                                                tieredServiceFees: { ...visaForm.tieredServiceFees, silver: e.target.value }
                                            });
                                        }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Default fee for new agents</p>
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                        <DollarSign size={16} className="mr-1 text-blue-500" /> Dynamic Tier Pricing
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Silver Fee</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-medium"
                                                value={visaForm.tieredServiceFees?.silver || visaForm.baseServiceFee}
                                                onChange={e => setVisaForm({ ...visaForm, tieredServiceFees: { ...visaForm.tieredServiceFees, silver: e.target.value } })}
                                            />
                                        </div>
                                        <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-200">
                                            <label className="block text-[10px] font-bold text-yellow-700 mb-1 uppercase">Gold Fee</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-yellow-200 rounded-lg p-2 text-sm font-medium"
                                                value={visaForm.tieredServiceFees?.gold || 0}
                                                onChange={e => setVisaForm({ ...visaForm, tieredServiceFees: { ...visaForm.tieredServiceFees, gold: e.target.value } })}
                                            />
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-300">
                                            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Platinum Fee</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-medium"
                                                value={visaForm.tieredServiceFees?.platinum || 0}
                                                onChange={e => setVisaForm({ ...visaForm, tieredServiceFees: { ...visaForm.tieredServiceFees, platinum: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 italic">* Set lower fees for higher tier agents to incentivize performance.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Processing Time</label>
                                    <input className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={visaForm.processingTime} onChange={e => setVisaForm({ ...visaForm, processingTime: e.target.value })} placeholder="e.g. 5-7 Business Days" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Validity</label>
                                    <input className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" value={visaForm.validity} onChange={e => setVisaForm({ ...visaForm, validity: e.target.value })} placeholder="e.g. 60 Days" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                                    <textarea className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" rows="3" value={visaForm.description} onChange={e => setVisaForm({ ...visaForm, description: e.target.value })} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Documents Required</label>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                        value={Array.isArray(visaForm.documentsRequired) ? visaForm.documentsRequired.join(', ') : visaForm.documentsRequired}
                                        onChange={e => setVisaForm({ ...visaForm, documentsRequired: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Passport Front, Photo, Bank Statement"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Separate multiple documents with commas</p>
                                </div>

                                <button onClick={handleSaveVisa} className="md:col-span-2 w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform active:scale-95">Save Visa Product</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Services;
