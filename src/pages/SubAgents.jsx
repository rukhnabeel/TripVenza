import React, { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, Mail, Phone, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const SubAgentCard = ({ agent }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {agent.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.agencyName || 'Sub-Agent'}</p>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${agent.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {agent.isActive ? 'Active' : 'Inactive'}
            </span>
        </div>

        <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-3 text-gray-400" />
                {agent.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <Phone size={16} className="mr-3 text-gray-400" />
                {agent.phone}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Permissions</p>
                <p className="text-sm font-medium text-gray-900 truncate" title={agent.permissions?.join(', ')}>
                    {agent.permissions?.length > 0 ? `${agent.permissions.length} Standard` : 'Basic'}
                </p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Wallet</p>
                <p className="text-sm font-bold text-gray-900">₹{agent.walletBalance || 0}</p>
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

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Add New Sub-Agent</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                            <AlertCircle size={16} className="mr-2" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            required
                            type="tel"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Password</label>
                        <input
                            required
                            type="text" // Visible for initial setup
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="e.g. Agent@123"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {[
                                { id: 'create_application', label: 'Create New Applications' },
                                { id: 'view_applications', label: 'View All Applications' },
                                { id: 'view_wallet', label: 'View Wallet Balance' },
                                { id: 'manage_settings', label: 'Manage Settings' }
                            ].map((perm) => (
                                <label key={perm.id} className="flex items-center space-x-3 cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                                            checked={formData.permissions.includes(perm.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                                                } else {
                                                    setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.id) });
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-700">{perm.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {loading ? <Loader className="animate-spin mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />}
                            {loading ? 'Creating...' : 'Create Sub-Agent'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
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
            fetchSubAgents(); // Refresh list
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create sub-agent');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sub-Agents Management</h1>
                    <p className="text-gray-500 mt-1">Manage your network of sub-agents and their permissions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center"
                >
                    <UserPlus size={20} className="mr-2" />
                    Add Sub-Agent
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <Loader className="animate-spin mr-2" size={24} />
                    Loading your network...
                </div>
            ) : subAgents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Sub-Agents Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Start building your network by adding your first sub-agent. They will operate under your agency umbrella.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    >
                        + Add First Sub-Agent
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
