import React, { useState, useMemo } from 'react';
import { Search, Filter, Briefcase, FileText, ChevronDown, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../store/slices/applicationsSlice';
import { Loader } from 'lucide-react';
import ApplicationStatusCard from '../components/ApplicationStatusCard';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const Applications = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { list, loading } = useSelector(state => state.applications);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    React.useEffect(() => {
        dispatch(fetchApplications());
    }, [dispatch]);

    const tabs = ['All', 'Draft', 'Pending', 'Processing', 'Approved', 'Rejected'];

    const filteredList = useMemo(() => {
        return list.filter(app => {
            const matchesSearch =
                (app.applicants?.[0]?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (app.applicants?.[0]?.passportNumber || '').includes(searchTerm) ||
                (app.applicationId || '').includes(searchTerm);

            if (activeTab === 'All') return matchesSearch;
            if (activeTab === 'Processing') return matchesSearch && ['Pending', 'Submitted', 'Processing'].includes(app.status);
            return matchesSearch && app.status === activeTab;
        });
    }, [list, searchTerm, activeTab]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
            >
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                                <Briefcase size={24} className="text-blue-50" />
                            </div>
                            <h1 className="text-3xl font-bold font-display">My Applications</h1>
                        </div>
                        <p className="text-blue-100/80 max-w-lg text-sm font-medium">
                            Track the real-time status of your visa applications, download e-visas, and manage rejections.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative overflow-hidden ${activeTab === tab
                                    ? 'bg-white text-blue-700 shadow-lg'
                                    : 'text-blue-100 hover:bg-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl"></div>
            </motion.div>

            {/* Search and Content */}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 relative group"
                >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by applicant name, passport number, or Application ID..."
                        className="w-full pl-14 pr-12 py-5 bg-white border border-gray-100/50 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-lg text-gray-800 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium animate-pulse">Loading your applications...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm"
                    >
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="text-blue-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {searchTerm ? `We couldn't find any results specifically for "${searchTerm}".` : "You haven't submitted any visa applications yet. Start a new one to get tracking!"}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <AnimatePresence>
                            {filteredList.map(app => (
                                <motion.div key={app._id} variants={itemVariants} layout>
                                    <ApplicationStatusCard application={app} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.div
                            variants={itemVariants}
                            className="text-center pt-8 pb-4"
                        >
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                                Showing {filteredList.length} application{filteredList.length !== 1 && 's'}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Applications;
