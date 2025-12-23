import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NewVisa = () => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-blue-600 font-medium hover:underline flex items-center"
                >
                    ← Back to Countries
                </button>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-6">
                    <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-16 h-10 object-cover rounded shadow-sm" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedCountry.name} Visa</h1>
                        <p className="text-gray-500">Select a visa type to proceed with the application.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCountry.visaTypes.map((visa, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-blue-50 px-3 py-1 rounded-bl-lg text-blue-700 text-xs font-bold">
                                {visa.entryType} Entry
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4">{visa.type}</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>Processing: <span className="font-medium text-gray-900">{visa.processingTime}</span></span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>Stay Period: <span className="font-medium text-gray-900">{visa.stayPeriod}</span></span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>Validity: <span className="font-medium text-gray-900">{visa.validity}</span></span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-xs text-gray-400">Total Fee</p>
                                    <p className="text-2xl font-bold text-blue-600">₹{visa.totalFee}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/apply', { state: { country: selectedCountry, visa: visa } })}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Select Destination</h1>
                    <p className="text-gray-500">Choose a country to start your visa application</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading countries...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredCountries.map((country) => (
                        <motion.div
                            key={country._id}
                            whileHover={{ y: -5 }}
                            onClick={() => fetchCountryDetails(country._id)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-all text-center group"
                        >
                            <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                                {country.flag ? (
                                    <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Flag</div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{country.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                                {country.region}
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && filteredCountries.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No countries found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default NewVisa;
