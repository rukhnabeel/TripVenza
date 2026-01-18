import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, MapPin, Clock, Calendar, CheckCircle2, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
const NewVisa = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Hook to read URL params
    const { user } = useSelector(state => state.auth);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || ''); // Initialize with URL param
    const [selectedCountry, setSelectedCountry] = useState(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const { data } = await api.get('/visa/countries');
            setCountries(data);
        } catch (error) {
            console.error('Failed to fetch countries', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchCountryDetails = async (id) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/visa/countries/${id}`);
            setSelectedCountry(data);
        } catch (error) {
            console.error('Failed to fetch country details', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedCountry) {
        return (
            <div className="space-y-8 animate-fade-in pb-10">
                {/* Back Button & Header */}
                <div>
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className="group text-gray-500 hover:text-blue-600 font-medium flex items-center mb-6 transition-colors"
                    >
                        <div className="p-2 bg-white border border-gray-200 rounded-lg mr-3 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </div>
                        Back to Countries
                    </button>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10 flex items-center space-x-8">
                            <div className="w-24 h-16 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                {selectedCountry.flag ? (
                                    <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Globe className="text-gray-300" size={32} />
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight mb-2">{selectedCountry.name} Visa</h1>
                                <p className="text-lg text-gray-500 font-medium">Select a visa type to proceed with your application.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visa Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {selectedCountry.visaTypes && selectedCountry.visaTypes.length > 0 ? (
                        selectedCountry.visaTypes.map((visa, idx) => {
                            const userTier = user?.tier?.toLowerCase() || 'silver';
                            const serviceFee = visa.tieredServiceFees?.[userTier] !== undefined
                                ? visa.tieredServiceFees[userTier]
                                : visa.baseServiceFee;
                            const dynamicTotalFee = Number(visa.govtFee) + Number(serviceFee);

                            const visaForApplication = {
                                ...visa,
                                totalFee: dynamicTotalFee,
                                appliedTier: userTier
                            };

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                                >
                                    {/* Header Strip */}
                                    <div className={`h-2 w-full ${visa.entryType === 'Multiple' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}></div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${visa.entryType === 'Multiple' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {visa.entryType} Entry
                                                </span>
                                                <h3 className="text-2xl font-bold text-gray-900 leading-tight">{visa.type}</h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <CheckCircle2 size={24} />
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8 flex-1">
                                            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                                                    <Clock size={16} />
                                                </div>
                                                <span className="text-sm">Processing: <span className="font-bold">{visa.processingTime}</span></span>
                                            </div>
                                            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                                                    <Calendar size={16} />
                                                </div>
                                                <span className="text-sm">Validity: <span className="font-bold">{visa.validity}</span></span>
                                            </div>
                                            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                                                    <MapPin size={16} />
                                                </div>
                                                <span className="text-sm">Stay Period: <span className="font-bold">{visa.stayPeriod}</span></span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex justify-between items-end mb-6">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Fees</p>
                                                    <div className="flex items-baseline">
                                                        <span className="text-3xl font-black text-gray-900 font-display">₹{dynamicTotalFee}</span>
                                                        <span className="text-sm text-gray-400 ml-1 font-medium">/pax</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">All Inclusive</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate('/dashboard/apply-visa', { state: { country: selectedCountry, visa: visaForApplication } })}
                                                className="w-full py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center group-hover:translate-y-0"
                                            >
                                                Apply Now <ArrowRight size={18} className="ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Visas Coming Soon</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We are currently updating our visa products for {selectedCountry.name}. Please check back later or contact support for assistance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight">New Application</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Select a destination to start a new visa application.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search countries (e.g. Dubai, Singapore)..."
                    className="block w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xl shadow-gray-200/40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                    {filteredCountries.map((country) => (
                        <motion.button
                            layout
                            key={country._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => fetchCountryDetails(country._id)}
                            className="group flex flex-col items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 text-center"
                        >
                            <div className="w-20 h-14 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50 mb-4 group-hover:scale-110 transition-transform duration-300">
                                {country.flag ? (
                                    <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Globe className="text-gray-300" size={24} />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{country.name}</h3>
                            <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                View Visas
                            </p>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {!loading && filteredCountries.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
                    <p className="text-gray-500">Try searching for a different country.</p>
                </div>
            )}
        </div>
    );
};

export default NewVisa;
