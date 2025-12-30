import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Ban, MoreHorizontal } from 'lucide-react';
import api from '../utils/api';

const ManageAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const { token } = useSelector(state => state.auth);
    const navigate = useNavigate();

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

            // Refresh list
            const { data } = await api.get('/users/agents');
            setAgents(data);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const statusStyles = {
        Pending: 'bg-orange-100 text-orange-700 border-orange-200',
        Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
        Approved: 'bg-green-100 text-green-700 border-green-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Agents</h1>
                    <p className="text-gray-500 mt-1">View and approve new agent registrations.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Agency Name</th>
                                <th className="py-4 px-6 font-semibold">Email</th>
                                <th className="py-4 px-6 font-semibold">Tier</th>
                                <th className="py-4 px-6 font-semibold">Type</th>
                                <th className="py-4 px-6 font-semibold">Docs</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : agents.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No agents found</td></tr>
                            ) : agents.map((agent) => (
                                <tr key={agent._id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        <div>{agent.agencyName || agent.name}</div>
                                        <div className="text-xs text-gray-400">{agent.name}</div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{agent.email}</td>
                                    <td className="py-4 px-6">
                                        <select
                                            className="text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={agent.tier || 'Silver'}
                                            onChange={async (e) => {
                                                const newTier = e.target.value;
                                                if (window.confirm(`Change ${agent.name}'s tier to ${newTier}?`)) {
                                                    try {
                                                        await api.patch(`/users/${agent._id}/tier`, { tier: newTier });
                                                        setAgents(agents.map(a => a._id === agent._id ? { ...a, tier: newTier } : a));
                                                    } catch (err) {
                                                        alert('Failed to update tier');
                                                    }
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="Silver">Silver</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Platinum">Platinum</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{agent.agencyType || 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => navigate('/admin/dashboard/documents', { state: { agentId: agent._id } })}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            View Docs
                                        </button>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[agent.kycStatus] || 'bg-gray-100'}`}>
                                            {agent.kycStatus}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(agent.kycStatus === 'Pending' || agent.kycStatus === 'Submitted') && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(agent._id, 'approve')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(agent._id, 'reject')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg tooltip"
                                                        title="Reject"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === agent._id ? null : agent._id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenu === agent._id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => {
                                                                handleStatusUpdate(agent._id, agent.isActive ? 'block' : 'unblock');
                                                                setActiveMenu(null);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${agent.isActive ? 'text-red-600' : 'text-green-600'}`}
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
