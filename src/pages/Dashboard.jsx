import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';

import NewVisa from './NewVisa';
import ApplyVisa from './ApplyVisa';
import Wallet from './Wallet';

import Overview from './Overview';
import Applications from './Applications';
import SubAgents from './SubAgents';
import Settings from './Settings';
import AgencyDocuments from '../components/AgencyDocuments';

const Dashboard = () => {
    const { isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
                <div className="mb-8"></div>

                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/new-visa" element={<NewVisa />} />
                    <Route path="/apply" element={<ApplyVisa />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/sub-agents" element={<SubAgents />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documents" element={<AgencyDocuments />} />
                    <Route path="*" element={<div className="text-gray-500">Page under construction</div>} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
