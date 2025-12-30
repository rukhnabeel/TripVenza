import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Search, MapPin, Globe } from 'lucide-react';
import api from '../../utils/api';
import { Loader } from 'lucide-react';

const AdminVisaManagement = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCountry, setExpandedCountry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState(null);
    const [editingVisa, setEditingVisa] = useState(null);

    // Form States
    const [countryForm, setCountryForm] = useState({ name: '', code: '', region: '', flag: '', description: '' });
    const [visaForm, setVisaForm] = useState({
        type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single',
        govtFee: '', baseServiceFee: '',
        documentsRequired: '', description: ''
    });

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const { data } = await api.get('/visa/countries');
            setCountries(data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountryDetails = async (id) => {
        try {
            const { data } = await api.get(`/visa/countries/${id}`);
            // Update the specific country in the list with full details (visaTypes)
            setCountries(prev => prev.map(c => c._id === id ? data : c));
        } catch (error) {
            console.error('Error fetching country details:', error);
        }
    };

    const toggleExpand = (countryId) => {
        if (expandedCountry === countryId) {
            setExpandedCountry(null);
        } else {
            setExpandedCountry(countryId);
            fetchCountryDetails(countryId); // Fetch visas when expanding
        }
    };

    // --- Country Handlers ---
    const handleSaveCountry = async (e) => {
        e.preventDefault();
        try {
            if (editingCountry) {
                await api.put(`/visa/countries/${editingCountry._id}`, countryForm);
            } else {
                await api.post('/visa/countries', countryForm);
            }
            fetchCountries();
            setIsCountryModalOpen(false);
            setCountryForm({ name: '', code: '', region: '', flag: '', description: '' });
            setEditingCountry(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save country');
        }
    };

    const handleDeleteCountry = async (id) => {
        if (!window.confirm('Are you sure? This will delete all associated visas.')) return;
        try {
            await api.delete(`/visa/countries/${id}`);
            fetchCountries();
        } catch (error) {
            alert('Failed to delete country');
        }
    };

    const openCountryModal = (country = null) => {
        if (country) {
            setEditingCountry(country);
            setCountryForm({
                name: country.name, code: country.code, region: country.region,
                flag: country.flag, description: country.description
            });
        } else {
            setEditingCountry(null);
            setCountryForm({ name: '', code: '', region: '', flag: '', description: '' });
        }
        setIsCountryModalOpen(true);
    };

    // --- Visa Handlers ---
    const handleSaveVisa = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...visaForm,
                documentsRequired: typeof visaForm.documentsRequired === 'string'
                    ? visaForm.documentsRequired.split(',').map(s => s.trim())
                    : visaForm.documentsRequired
            };

            if (editingVisa) {
                await api.put(`/visa/countries/${expandedCountry}/visas/${editingVisa._id}`, payload);
            } else {
                await api.post(`/visa/countries/${expandedCountry}/visas`, payload);
            }
            fetchCountryDetails(expandedCountry);
            setIsVisaModalOpen(false);
            setEditingVisa(null);
            setVisaForm({ type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single', govtFee: '', baseServiceFee: '', documentsRequired: '', description: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save visa');
        }
    };

    const handleDeleteVisa = async (visaId) => {
        if (!window.confirm('Delete this visa type?')) return;
        try {
            await api.delete(`/visa/countries/${expandedCountry}/visas/${visaId}`);
            fetchCountryDetails(expandedCountry);
        } catch (error) {
            alert('Failed to delete visa');
        }
    };

    const openVisaModal = (visa = null) => {
        if (visa) {
            setEditingVisa(visa);
            setVisaForm({
                ...visa,
                documentsRequired: visa.documentsRequired?.join(', ')
            });
        } else {
            setEditingVisa(null);
            setVisaForm({ type: '', processingTime: '', validity: '', stayPeriod: '', entryType: 'Single', govtFee: '', baseServiceFee: '', documentsRequired: 'Passport Front, Passport Back, Photo', description: '' });
        }
        setIsVisaModalOpen(true);
    };

    const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visa Products</h1>
                    <p className="text-gray-500">Manage countries and their visa types.</p>
                </div>
                <button
                    onClick={() => openCountryModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} className="mr-2" /> Add Country
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search countries..."
                    className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Countries List */}
            {loading ? (
                <div className="text-center py-10"><Loader className="animate-spin mx-auto text-blue-600" /></div>
            ) : (
                <div className="space-y-4">
                    {filteredCountries.map(country => (
                        <div key={country._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleExpand(country._id)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden shadow-sm">
                                        {country.flag ? <img src={country.flag} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center">
                                            {country.name}
                                            <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{country.code}</span>
                                        </h3>
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <Globe size={14} className="mr-1" /> {country.region}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openCountryModal(country); }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCountry(country._id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedCountry === country._id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                            </div>

                            {/* Visa Types (Expanded) */}
                            {expandedCountry === country._id && (
                                <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-gray-700">Available Visa Types</h4>
                                        <button
                                            onClick={() => openVisaModal()}
                                            className="text-sm bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg flex items-center shadow-sm"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Visa Type
                                        </button>
                                    </div>

                                    {!country.visaTypes || country.visaTypes.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No visa types added yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {country.visaTypes.map(visa => (
                                                <div key={visa._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{visa.type}</h5>
                                                            <p className="text-xs text-gray-500">{visa.entryType} Entry • {visa.validity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-blue-600">₹{visa.totalFee}</p>
                                                            <p className="text-[10px] text-gray-400">Govt: {visa.govtFee} + Svc: {visa.baseServiceFee}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openVisaModal(visa)}
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVisa(visa._id)}
                                                            className="text-xs text-red-600 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Country Modal */}
            {isCountryModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{editingCountry ? 'Edit Country' : 'Add New Country'}</h3>
                        <form onSubmit={handleSaveCountry} className="space-y-4">
                            <input type="text" placeholder="Country Name" required className="w-full p-2 border rounded" value={countryForm.name} onChange={e => setCountryForm({ ...countryForm, name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Code (e.g. AE)" required className="w-full p-2 border rounded" value={countryForm.code} onChange={e => setCountryForm({ ...countryForm, code: e.target.value })} />
                                <input type="text" placeholder="Region" className="w-full p-2 border rounded" value={countryForm.region} onChange={e => setCountryForm({ ...countryForm, region: e.target.value })} />
                            </div>
                            <input type="text" placeholder="Flag URL" className="w-full p-2 border rounded" value={countryForm.flag} onChange={e => setCountryForm({ ...countryForm, flag: e.target.value })} />
                            <textarea placeholder="Description" className="w-full p-2 border rounded" value={countryForm.description} onChange={e => setCountryForm({ ...countryForm, description: e.target.value })} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsCountryModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Visa Modal */}
            {isVisaModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{editingVisa ? 'Edit Visa' : 'Add Visa Type'}</h3>
                        <form onSubmit={handleSaveVisa} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Visa Type Name" required className="w-full p-2 border rounded col-span-2" value={visaForm.type} onChange={e => setVisaForm({ ...visaForm, type: e.target.value })} />
                                <input type="text" placeholder="Processing Time" className="w-full p-2 border rounded" value={visaForm.processingTime} onChange={e => setVisaForm({ ...visaForm, processingTime: e.target.value })} />
                                <input type="text" placeholder="Validity" className="w-full p-2 border rounded" value={visaForm.validity} onChange={e => setVisaForm({ ...visaForm, validity: e.target.value })} />
                                <input type="text" placeholder="Stay Period" className="w-full p-2 border rounded" value={visaForm.stayPeriod} onChange={e => setVisaForm({ ...visaForm, stayPeriod: e.target.value })} />
                                <select className="w-full p-2 border rounded" value={visaForm.entryType} onChange={e => setVisaForm({ ...visaForm, entryType: e.target.value })}>
                                    <option value="Single">Single Entry</option>
                                    <option value="Multiple">Multiple Entry</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                                <label className="block text-sm">
                                    Govt Fee (₹)
                                    <input type="number" className="w-full p-2 border rounded mt-1" value={visaForm.govtFee} onChange={e => setVisaForm({ ...visaForm, govtFee: e.target.value })} />
                                </label>
                                <label className="block text-sm">
                                    Base Service Fee (₹)
                                    <input type="number" className="w-full p-2 border rounded mt-1" value={visaForm.baseServiceFee} onChange={e => setVisaForm({ ...visaForm, baseServiceFee: e.target.value })} />
                                </label>
                            </div>
                            <textarea placeholder="Documents Required (comma separated)" className="w-full p-2 border rounded" value={visaForm.documentsRequired} onChange={e => setVisaForm({ ...visaForm, documentsRequired: e.target.value })} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsVisaModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Visa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVisaManagement;
