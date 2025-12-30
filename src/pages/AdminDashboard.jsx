import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AdminSidebar from '../components/AdminSidebar';

// Pages
import AdminOverview from './AdminOverview';
import Services from './Services';
import AdminApplications from './admin/AdminApplications';
import AdminApplicationDetails from './admin/AdminApplicationDetails';
import AdminVisaManagement from './admin/AdminVisaManagement';
import Settings from './Settings';
import VerifyDocuments from './VerifyDocuments';
import ManageAgents from './ManageAgents';
import AdminWalletRequests from './AdminWalletRequests';

const AdminDashboard = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <AdminSidebar />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8"></div>

                <Routes>
                    <Route path="/" element={<AdminOverview />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documents" element={<VerifyDocuments />} />
                    <Route path="/applications" element={<AdminApplications />} />
                    <Route path="/applications/:id" element={<AdminApplicationDetails />} />
                    <Route path="/agents" element={<ManageAgents />} />
                    <Route path="/visas" element={<AdminVisaManagement />} />
                    <Route path="/wallet-requests" element={<AdminWalletRequests />} />
                    <Route path="*" element={<div className="text-gray-500">Page not found.</div>} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
