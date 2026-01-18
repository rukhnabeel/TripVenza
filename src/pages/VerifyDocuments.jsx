import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, FileText, AlertCircle, Shield, Calendar, Mail, Phone, Building, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyDocuments = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    // Constant for file server
    const FILE_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

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
            // alert(`Documents ${action}d successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleSingleDocVerify = async (agentId, docType, verified) => {
        try {
            const { data } = await api.put(`/documents/verify/${agentId}/${docType}`, {
                verified,
                rejectionReason: verified ? null : 'Document rejected by admin'
            });

            // Update local state for the selected agent
            setSelectedAgent(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [docType]: {
                        ...prev.documents[docType],
                        verified: verified
                    }
                },
                kycStatus: data.kycStatus // Update overall status if changed (e.g. auto-approved)
            }));

            // Also update the list if needed (optional, or just on close)
            setAgents(prev => prev.map(a =>
                a._id === agentId ? { ...a, kycStatus: data.kycStatus } : a
            ));

        } catch (error) {
            console.error('Error verifying document:', error);
            alert(error.response?.data?.message || 'Failed to verify document');
        }
    };

    const filteredAgents = agents.filter(agent =>
        (agent.agencyName || agent.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderDocumentLink = (doc, title, docKey) => {
        if (!doc || !doc.url) return null;

        const isVerified = doc.verified;

        return (
            <div className={`group relative border rounded-xl p-4 transition-all bg-white ${isVerified ? 'border-green-200 shadow-sm' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg transition-colors ${isVerified ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        {isVerified ? <CheckCircle size={20} /> : <FileText size={20} />}
                    </div>
                    {isVerified && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">VERIFIED</span>}
                    {!isVerified && <span className="text-xs font-mono text-gray-400">PENDING</span>}
                </div>

                <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                </div>

                <div className="flex gap-2 mt-4">
                    <a
                        href={doc.url.startsWith('http') ? doc.url : `${FILE_BASE_URL}${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-gray-50 text-center text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Eye size={14} /> View
                    </a>

                    {!isVerified ? (
                        <button
                            onClick={() => handleSingleDocVerify(selectedAgent._id, docKey, true)}
                            className="flex-1 py-2 bg-green-50 text-green-700 font-bold text-xs rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                        >
                            Approve
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSingleDocVerify(selectedAgent._id, docKey, false)}
                            className="flex-1 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                        >
                            Revoke
                        </button>
                    )}
                </div>
            </div>
        );
    };

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
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                                <Shield size={24} className="text-blue-200" />
                            </div>
                            <h1 className="text-3xl font-bold font-display">Verification Center</h1>
                        </div>
                        <p className="text-slate-300 max-w-lg text-sm font-medium leading-relaxed">
                            Review and approve KYC documents submmitted by new agency partners.
                            <span className="ml-2 bg-white/10 px-2 py-0.5 rounded text-xs text-white border border-white/10">{agents.length} Pending</span>
                        </p>
                    </div>

                    <div className="relative w-full md:w-auto min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by agency or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredAgents.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 max-w-md mx-auto">There are no pending documents to review at this moment. Great job!</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredAgents.map((agent) => (
                        <motion.div
                            key={agent._id}
                            variants={itemVariants}
                            layoutId={agent._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                            onClick={() => setSelectedAgent(agent)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                                        {(agent.agencyName || agent.name).charAt(0)}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${agent.kycStatus === 'Submitted' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                        {agent.kycStatus === 'Submitted' ? 'Review Ready' : 'Pending Info'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{agent.agencyName || agent.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                    <Building size={12} /> {agent.agencyType || 'Travel Agency'}
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                                        <Mail size={14} className="mr-2 text-gray-400" /> {agent.email}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                                        <Phone size={14} className="mr-2 text-gray-400" /> {agent.phone}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center group-hover:shadow-lg"
                                    >
                                        Review Docs <ChevronRight size={14} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {selectedAgent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedAgent(null)}
                        />
                        <motion.div
                            layoutId={selectedAgent._id}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm">
                                        {(selectedAgent.agencyName || selectedAgent.name).charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedAgent.agencyName || selectedAgent.name}</h2>
                                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                            <span>{selectedAgent.email}</span> • <span>{selectedAgent.phone}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all border border-gray-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Details */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">Business Details</h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-blue-600/70 uppercase block mb-1">PAN Number</span>
                                                    <p className="font-mono font-medium text-gray-900 bg-white px-2 py-1 rounded border border-blue-100 inline-block">{selectedAgent.panNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-blue-600/70 uppercase block mb-1">GST Number</span>
                                                    <p className="font-mono font-medium text-gray-900 bg-white px-2 py-1 rounded border border-blue-100 inline-block">{selectedAgent.gstNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-blue-600/70 uppercase block mb-1">Address</span>
                                                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-blue-100">
                                                        {selectedAgent.address?.street}, {selectedAgent.address?.city}, {selectedAgent.address?.state}, {selectedAgent.address?.country} - {selectedAgent.address?.zip}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-blue-600/70 uppercase block mb-1">Registered On</span>
                                                    <p className="text-sm text-gray-900 flex items-center gap-2">
                                                        <Calendar size={14} className="text-blue-400" />
                                                        {new Date(selectedAgent.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Documents */}
                                    <div className="lg:col-span-2">
                                        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                            Submitted Documents
                                            <span className="ml-3 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-normal border border-gray-200">
                                                {Object.keys(selectedAgent.documents || {}).length} Files
                                            </span>
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {renderDocumentLink(selectedAgent.documents?.panCard, 'PAN Card', 'panCard')}
                                            {renderDocumentLink(selectedAgent.documents?.aadhaarCard, 'Aadhaar Card', 'aadhaarCard')}
                                            {renderDocumentLink(selectedAgent.documents?.gstCertificate, 'GST Certificate', 'gstCertificate')}
                                            {renderDocumentLink(selectedAgent.documents?.addressProof, 'Address Proof', 'addressProof')}
                                            {renderDocumentLink(selectedAgent.documents?.ownerPhoto, 'Owner Photo', 'ownerPhoto')}
                                        </div>

                                        {(!selectedAgent.documents || Object.keys(selectedAgent.documents).length === 0) && (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                                <AlertCircle size={40} className="mx-auto mb-4 text-gray-300" />
                                                <p className="text-gray-500 font-medium">No documents have been uploaded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end gap-3 rounded-b-3xl">
                                <button
                                    onClick={() => handleVerifyDocument(selectedAgent._id, 'reject')}
                                    className="px-6 py-3 border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center"
                                >
                                    <XCircle size={18} className="mr-2" /> Reject Application
                                </button>
                                <button
                                    onClick={() => handleVerifyDocument(selectedAgent._id, 'approve')}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 flex items-center"
                                >
                                    <CheckCircle size={18} className="mr-2" /> Approve Agent
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VerifyDocuments;
