import React, { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, Mail, Phone, X, Loader, CheckCircle, AlertCircle, Shield, CreditCard, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const SubAgentCard = ({ agent }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                    {agent.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${agent.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Shield size={10} /> {agent.agencyName || 'Sub-Agent'}
                        </span>
                    </div>
                </div>
            </div>
            <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-gray-600 p-3 bg-gray-50/50 rounded-xl">
                <Mail size={16} className="mr-3 text-blue-500" />
                <span className="truncate font-medium">{agent.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 p-3 bg-gray-50/50 rounded-xl">
                <Phone size={16} className="mr-3 text-blue-500" />
                <span className="font-medium">{agent.phone}</span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Privileges</p>
                <div className="flex -space-x-2">
                    {agent.permissions?.map((p, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-700 font-bold" title={p}>
                            {p.charAt(0).toUpperCase()}
                        </div>
                    )).slice(0, 3)}
                    {(agent.permissions?.length || 0) > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-600 font-bold">
                            +{agent.permissions.length - 3}
                        </div>
                    )}
                    {(agent.permissions?.length || 0) === 0 && <span className="text-sm font-medium text-gray-500">None</span>}
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Wallet</p>
                <div className="flex items-center gap-1 text-gray-900 font-black">
                    <CreditCard size={14} className="text-gray-400" /> ₹{(agent.walletBalance || 0).toLocaleString()}
                </div>
            </div>
        </div>
    </div>
);

const AddSubAgentModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', permissions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onAdd(formData);
            onClose();
            setFormData({ name: '', email: '', phone: '', password: '', permissions: [] });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-all"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-gray-100">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Add New Sub-Agent</h3>
                                    <p className="text-sm text-gray-500 mt-1">Create an account for your team member.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-start border border-red-100">
                                        <AlertCircle size={18} className="mr-3 mt-0.5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                            placeholder="e.g. John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                            placeholder="john@agency.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Default Password</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Access Permissions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { id: 'create_application', label: 'Create Applications', desc: 'Can submit new visas' },
                                            { id: 'view_applications', label: 'View All Applications', desc: 'Can see full history' },
                                            { id: 'view_wallet', label: 'View Wallet', desc: 'Can check balance' },
                                            { id: 'manage_settings', label: 'Manage Settings', desc: 'Can update profile' }
                                        ].map((perm) => (
                                            <label key={perm.id} className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.id) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={formData.permissions.includes(perm.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                                                        else setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.id) });
                                                    }}
                                                />
                                                <div className="ml-3">
                                                    <span className="block text-sm font-bold text-gray-900">{perm.label}</span>
                                                    <span className="block text-xs text-gray-500">{perm.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-gray-900/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {loading ? <Loader className="animate-spin mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />}
                                        {loading ? 'Creating Account...' : 'Create Sub-Agent Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const SubAgents = () => {
    const [subAgents, setSubAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSubAgents = async () => {
        try {
            const { data } = await api.get('/users/sub-agents');
            setSubAgents(data);
        } catch (error) {
            console.error('Error fetching sub-agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubAgents();
    }, []);

    const handleAddSubAgent = async (formData) => {
        try {
            await api.post('/users/sub-agents', formData);
            fetchSubAgents();
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create sub-agent');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Sub-Agents</h1>
                    <p className="text-gray-500 mt-2 text-lg">Expand your reach by adding team members or sub-agents.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <UserPlus size={20} />
                    Add New Agent
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : subAgents.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserPlus size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Sub-Agents Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">Start building your network by adding your first sub-agent. They will operate under your agency umbrella.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        Add First Sub-Agent <ChevronRight size={16} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subAgents.map(agent => (
                        <SubAgentCard key={agent._id} agent={agent} />
                    ))}
                </div>
            )}

            <AddSubAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddSubAgent}
            />
        </div>
    );
};

export default SubAgents;
