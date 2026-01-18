import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Ban, MoreHorizontal, Users, ShieldAlert, Award, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../utils/api';

const ManageAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const { token } = useSelector(state => state.auth);
    const navigate = useNavigate();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const { data } = await api.get('/users/agents');
                setAgents(data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAgents();
        }
    }, [token]);

    const handleStatusUpdate = async (id, action, reason = '') => {
        if (!window.confirm(`Are you sure you want to ${action} this agent?`)) return;

        try {
            await api.patch(`/users/${id}/status`, { action, reason });
            const { data } = await api.get('/users/agents');
            setAgents(data);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleTierUpdate = async (agent, newTier) => {
        if (window.confirm(`Change ${agent.name}'s tier to ${newTier}?`)) {
            try {
                await api.patch(`/users/${agent._id}/tier`, { tier: newTier });
                setAgents(agents.map(a => a._id === agent._id ? { ...a, tier: newTier } : a));
            } catch (err) {
                alert('Failed to update tier');
            }
        }
    }

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const matchesSearch = (agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.email?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'All' || agent.kycStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [agents, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: agents.length,
            pending: agents.filter(a => a.kycStatus === 'Submitted').length,
            approved: agents.filter(a => a.kycStatus === 'Approved').length
        };
    }, [agents]);

    const statusStyles = {
        Pending: 'bg-orange-50 text-orange-700 border-orange-100',
        Submitted: 'bg-blue-50 text-blue-700 border-blue-100',
        Approved: 'bg-green-50 text-green-700 border-green-100',
        Rejected: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Users size={24} className="text-purple-200" />
                            </div>
                            <h1 className="text-3xl font-bold">Agent Management</h1>
                        </div>
                        <p className="text-purple-100/90 max-w-lg">
                            Oversee agent partnerships, verify KYC documents, and manage account tiers.
                        </p>
                    </div>
                    {/* Quick Stats in Header */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl min-w-[120px]">
                            <p className="text-xs text-purple-200 uppercase font-bold tracking-wider">Total Agents</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl min-w-[120px]">
                            <p className="text-xs text-orange-200 uppercase font-bold tracking-wider">Pending KYC</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search agency, name, or email..."
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Submitted', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${statusFilter === status
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'Submitted' ? 'Pending' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Agents Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Agency Details</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Tier</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-gray-500">Loading agents...</td></tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                                <Users size={24} />
                                            </div>
                                            <p className="font-medium">No agents found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAgents.map((agent) => (
                                <tr key={agent._id} className="hover:bg-purple-50/30 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 shadow-sm">
                                                {(agent.agencyName || agent.name)?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{agent.agencyName || 'No Agency Name'}</div>
                                                <div className="text-xs text-gray-500">{agent.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        <div className="font-medium">{agent.email}</div>
                                        <div className="text-xs text-gray-400">{agent.phone || 'No Phone'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="relative inline-block">
                                            <select
                                                className="appearance-none pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 cursor-pointer focus:ring-2 focus:ring-purple-500/20 outline-none"
                                                value={agent.tier || 'Silver'}
                                                onChange={(e) => handleTierUpdate(agent, e.target.value)}
                                            >
                                                <option value="Silver">Silver</option>
                                                <option value="Gold">Gold</option>
                                                <option value="Platinum">Platinum</option>
                                            </select>
                                            <Award size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[agent.kycStatus] || 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                            {agent.kycStatus === 'Submitted' && <ShieldAlert size={12} className="mr-1.5" />}
                                            {agent.kycStatus === 'Approved' && <CheckCircle size={12} className="mr-1.5" />}
                                            {agent.kycStatus}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(agent.kycStatus === 'Pending' || agent.kycStatus === 'Submitted') && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(agent._id, 'approve')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                                        title="Approve KYC"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(agent._id, 'reject')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                        title="Reject KYC"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => navigate('/admin/dashboard/documents', { state: { agentId: agent._id } })}
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all"
                                            >
                                                View Docs
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === agent._id ? null : agent._id)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenu === agent._id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={() => {
                                                                handleStatusUpdate(agent._id, agent.isActive ? 'block' : 'unblock');
                                                                setActiveMenu(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 font-medium ${agent.isActive ? 'text-red-600' : 'text-green-600'}`}
                                                        >
                                                            {agent.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                            {agent.isActive ? 'Block Agent' : 'Unblock Agent'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageAgents;
