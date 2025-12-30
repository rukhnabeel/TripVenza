import React, { useEffect, useState } from 'react';
import { Users, FileText, Wallet, CheckCircle, ArrowUpRight, ShieldAlert, TrendingUp, Calendar, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Loader } from 'lucide-react';

// --- Premium Components ---

const StatCard = ({ title, value, change, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${color.replace('text-', 'bg-')}`}></div>

        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">{title}</p>
                <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                    {change && (
                        <span className="text-green-500 font-bold text-xs flex items-center mb-1 bg-green-50 px-1.5 py-0.5 rounded">
                            <TrendingUp size={12} className="mr-1" /> {change}
                        </span>
                    )}
                </div>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const RecentActivityTable = ({ applications }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Recent Applications</h3>
            <Link to="/admin/dashboard/applications" className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center">
                View All <ArrowUpRight size={16} className="ml-1" />
            </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4 text-left">Applicant</th>
                        <th className="px-6 py-4 text-left">Destination</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {applications.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No recent activity</td>
                        </tr>
                    ) : (
                        applications.slice(0, 5).map((app) => (
                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                                            {(app.isGroupApplication ? app.groupName : app.applicants[0]?.firstName)?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {app.isGroupApplication ? app.groupName : `${app.applicants[0]?.firstName} ${app.applicants[0]?.lastName}`}
                                            </p>
                                            <p className="text-xs text-gray-500">{app.isGroupApplication ? 'Group App' : 'Individual'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{app.country?.name || 'Unknown'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                app.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalAgents: 0,
        pendingAgents: 0,
        pendingWalletRequests: 0,
        totalApplications: 0,
        recentApplications: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching for dashboard speed
                const [agentsRes, walletRes, appsRes] = await Promise.all([
                    api.get('/users/agents'),
                    api.get('/wallet/requests'),
                    api.get('/applications')
                ]);

                const agents = agentsRes.data || [];
                const walletReqs = walletRes.data || [];
                const allApps = appsRes.data || [];

                setStats({
                    totalAgents: agents.length,
                    pendingAgents: agents.filter(a => a.kycStatus === 'Pending').length,
                    pendingWalletRequests: walletReqs.filter(w => w.status === 'Pending').length,
                    totalApplications: allApps.length,
                    recentApplications: allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort descending
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in custom-scrollbar pb-10">
            {/* Header */}
            <div className="flex justify-between items-end bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-200 font-medium mb-1">Welcome back,</p>
                    <h1 className="text-3xl font-bold">Administrator</h1>
                    <p className="text-blue-100/80 mt-2 max-w-xl text-sm leading-relaxed">
                        Here's what's happening on TripVenza today. You have <span className="font-bold text-white underline decoration-yellow-400 decoration-2 underline-offset-2">{stats.pendingAgents} new agents</span> waiting for verification and <span className="font-bold text-white underline decoration-pink-400 decoration-2 underline-offset-2">{stats.pendingWalletRequests} wallet requests</span> to process.
                    </p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 relative z-20 px-2 text-left">
                <StatCard
                    title="Total Agents"
                    value={stats.totalAgents}
                    change="+12%"
                    subtext="Verified Partners"
                    icon={Users}
                    color="text-blue-600"
                />
                <StatCard
                    title="Pending KYC"
                    value={stats.pendingAgents}
                    subtext="Requires Action"
                    icon={ShieldAlert}
                    color="text-orange-600"
                />
                <StatCard
                    title="Wallet Requests"
                    value={stats.pendingWalletRequests}
                    subtext="Pending Approval"
                    icon={Wallet}
                    color="text-purple-600"
                />
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    change="+5% today"
                    subtext="All Time"
                    icon={FileText}
                    color="text-green-600"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) - Activity & Charts */}
                <div className="lg:col-span-2 space-y-8">
                    <RecentActivityTable applications={stats.recentApplications} />

                    {/* Mock Chart Section (Visual Only for now) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Platform Growth</h3>
                            <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1 outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                            {[40, 65, 30, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-md transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-600"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h * 12}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-gray-400 uppercase font-semibold">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) - Actions & Info */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                            <CheckCircle size={20} className="text-blue-600 mr-2" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            <Link to="/admin/dashboard/visas" className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-all border border-gray-100 hover:border-blue-200 group">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold block text-sm">Add New Visa Type</span>
                                    <span className="text-xs text-gray-400">Manage Pricing</span>
                                </div>
                            </Link>
                            <Link to="/admin/dashboard/agents" className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-all border border-gray-100 hover:border-purple-200 group">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <Users size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold block text-sm">Review New Agents</span>
                                    <span className="text-xs text-gray-400">{stats.pendingAgents} waiting</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Pending Wallets Teaser */}
                    {stats.pendingWalletRequests > 0 && (
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Wallet size={24} className="text-white" />
                                    </div>
                                    <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Urgent</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{stats.pendingWalletRequests} Requests</h3>
                                <p className="text-purple-100 text-sm mb-4">Agents waiting for wallet approval.</p>
                                <Link to="/admin/dashboard/wallet-requests" className="block w-full text-center py-2 bg-white text-purple-700 font-bold rounded-lg text-sm hover:bg-purple-50 transition-colors">
                                    Process Now
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
