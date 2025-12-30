import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, FileText, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const VerifyDocuments = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const location = useLocation();

    // Constant for file server
    const FILE_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchPendingAgents();
    }, []);

    useEffect(() => {
        if (agents.length > 0 && location.state?.agentId) {
            const preSelected = agents.find(a => a._id === location.state.agentId);
            if (preSelected) {
                setSelectedAgent(preSelected);
            }
        }
    }, [agents, location.state]);

    const fetchPendingAgents = async () => {
        try {
            const { data } = await api.get('/users/agents');
            // Filter agents with pending or submitted KYC
            const pendingAgents = data.filter(agent =>
                agent.kycStatus === 'Pending' || agent.kycStatus === 'Submitted'
            );
            setAgents(pendingAgents);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDocument = async (agentId, action, reason = '') => {
        if (!window.confirm(`Are you sure you want to ${action} this agent's documents?`)) return;

        try {
            await api.patch(`/users/${agentId}/status`, { action, reason });

            // Refresh list
            fetchPendingAgents();
            setSelectedAgent(null);
            alert(`Documents ${action}d successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const viewDocuments = (agent) => {
        setSelectedAgent(agent);
    };

    const statusStyles = {
        Pending: 'bg-orange-100 text-orange-700 border-orange-200',
        Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const renderDocumentLink = (doc, title) => {
        if (!doc || !doc.url) return null;
        return (
            <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
                <a
                    href={`${FILE_BASE_URL}${doc.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                >
                    <Eye size={14} className="mr-1" />
                    View Document
                </a>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify Agent Documents</h1>
                    <p className="text-gray-500 mt-1">Review and approve agent KYC documents.</p>
                </div>
            </div>

            {/* Agents List */}
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
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-2">Loading agents...</p>
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No pending documents</p>
                            <p className="text-gray-400 text-sm mt-1">All agent documents have been verified</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-6 font-semibold">Agency Name</th>
                                    <th className="py-4 px-6 font-semibold">Email</th>
                                    <th className="py-4 px-6 font-semibold">Type</th>
                                    <th className="py-4 px-6 font-semibold">Status</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                                        <td className="py-4 px-6 font-medium text-gray-900">
                                            <div>{agent.agencyName || agent.name}</div>
                                            <div className="text-xs text-gray-400">{agent.name}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{agent.email}</td>
                                        <td className="py-4 px-6 text-gray-600">{agent.agencyType || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[agent.kycStatus] || 'bg-gray-100'}`}>
                                                {agent.kycStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => viewDocuments(agent)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Documents"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyDocument(agent._id, 'approve')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyDocument(agent._id, 'reject')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {selectedAgent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedAgent.agencyName || selectedAgent.name}</h2>
                                <p className="text-gray-500 text-sm">{selectedAgent.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAgent(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Agent Information */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Agent Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">PAN Number:</span>
                                        <p className="font-medium">{selectedAgent.panNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">GST Number:</span>
                                        <p className="font-medium">{selectedAgent.gstNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Agency Type:</span>
                                        <p className="font-medium">{selectedAgent.agencyType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Phone:</span>
                                        <p className="font-medium">{selectedAgent.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderDocumentLink(selectedAgent.documents?.panCard, 'PAN Card')}
                                    {renderDocumentLink(selectedAgent.documents?.aadhaarCard, 'Aadhaar Card')}
                                    {renderDocumentLink(selectedAgent.documents?.gstCertificate, 'GST Certificate')}
                                    {renderDocumentLink(selectedAgent.documents?.addressProof, 'Address Proof')}
                                </div>

                                {(!selectedAgent.documents || Object.keys(selectedAgent.documents).length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                                        <p>No documents uploaded yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleVerifyDocument(selectedAgent._id, 'reject')}
                                    className="px-6 py-2.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerifyDocument(selectedAgent._id, 'approve')}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyDocuments;
