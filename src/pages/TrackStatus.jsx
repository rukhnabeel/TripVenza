import React, { useState } from 'react';
import { Search, ArrowRight, Loader, Globe, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ApplicationStatusCard from '../components/ApplicationStatusCard';
import logo from '../assets/tripvenza_logo.png';

const TrackStatus = () => {
    const [referenceId, setReferenceId] = useState('');
    const [loading, setLoading] = useState(false);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!referenceId.trim()) return;

        setLoading(true);
        setError(null);
        setApplication(null);

        try {
            const { data } = await api.get(`/applications/track/${referenceId}`);
            setApplication(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Application not found. Please check your Reference ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform">
                        <img src={logo} alt="TripVenza Holidays" className="h-16 w-auto object-contain" />
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-gray-900 mb-2 font-display tracking-tight"
                    >
                        Track Your Application
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Enter your Reference ID to check the latest status.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8"
                >
                    <form onSubmit={handleTrack} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="refId" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Reference Number / Group ID
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    id="refId"
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg"
                                    placeholder="e.g. TV-2025-00001"
                                    value={referenceId}
                                    onChange={(e) => setReferenceId(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !referenceId.trim()}
                            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-lg font-bold text-white bg-gray-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            {loading ? (
                                <Loader className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Track Status <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center flex items-center justify-center"
                            >
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Result Section */}
                <AnimatePresence mode="wait">
                    {application && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8"
                        >
                            <ApplicationStatusCard application={application} />

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => { setApplication(null); setReferenceId(''); }}
                                    className="text-gray-500 hover:text-gray-900 text-sm font-medium underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 transition-all"
                                >
                                    Check Another Application
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer simple link */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} TripVenza Holidays. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrackStatus;
