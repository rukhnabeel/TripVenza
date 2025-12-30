import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AgentSidebar from '../components/AgentSidebar';

// Pages
import Overview from './Overview';
import NewVisa from './NewVisa';
import ApplyVisa from './ApplyVisa';
import Wallet from './Wallet';
import Applications from './Applications';
import SubAgents from './SubAgents';
import Settings from './Settings';
import AgencyDocuments from '../components/AgencyDocuments';
import ApplicationSuccess from './ApplicationSuccess';
import PaymentPage from './PaymentPage';

const AgentDashboard = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Close sidebar on route change (mobile)
    const location = useLocation();
    React.useEffect(() => {
        closeSidebar();
    }, [location]);

    return (
        <div className="flex bg-gray-50/50 min-h-screen font-sans text-gray-900">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300 animate-fade-in"
                />
            )}

            <AgentSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <div className="sticky top-0 z-20 md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <span className="font-bold text-gray-900 tracking-tight">TripVenza</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/new-visa" element={<NewVisa />} />
                        <Route path="/apply" element={<ApplyVisa />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/sub-agents" element={<SubAgents />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/documents" element={<AgencyDocuments />} />
                        <Route path="/applications" element={<Applications />} />
                        <Route path="/application-success" element={<ApplicationSuccess />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="*" element={<div className="text-gray-500 text-center py-20">Page not found.</div>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
