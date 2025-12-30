import React, { useEffect, useState } from 'react';
import { FileText, Wallet, CheckCircle, Clock, Plus, ArrowUpRight, Search, TrendingUp, AlertCircle, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { slugify } from '../utils/helpers';
import { Loader } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${color.replace('text-', 'bg-')}`}></div>

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-3">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {trend && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center">
                            <TrendingUp size={10} className="mr-1" /> {trend}
                        </span>
                    )}
                </div>
                {subtext && <p className="text-sm text-gray-400 mt-2 font-medium">{subtext}</p>}
            </div>
            <div className={`p-3.5 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Overview = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });
    const [recentApps, setRecentApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch applications to calculate stats
                // Ideally this should be a /dashboard/stats endpoint for performance
                // But considering the user scope, fetching all apps might be okay for MVP
                const { data } = await api.get('/applications/my-applications');

                const total = data.length;
                const approved = data.filter(app => app.status === 'Approved').length;
                const pending = data.filter(app => app.status === 'Submitted' || app.status === 'Processing').length;
                const rejected = data.filter(app => app.status === 'Rejected').length;

                setStats({ total, approved, pending, rejected });
                setRecentApps(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const slug = user ? slugify(user.agencyName || user.name) : '';

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Welcome back,</p>
                            <h1 className="text-3xl font-bold">{user?.agencyName || user?.name}</h1>
                            <p className="text-blue-100/80 mt-2 text-sm max-w-lg">
                                Your current wallet balance is <span className="font-bold text-white text-lg">₹{user?.walletBalance || 0}</span>.
                                {user?.walletBalance < 1000 && (
                                    <span className="ml-2 bg-red-400/20 px-2 py-0.5 rounded text-xs text-red-100 border border-red-400/30 flex-inline items-center gap-1">
                                        <AlertCircle size={10} className="inline" /> Low Balance
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to={`/${slug}/dashboard/wallet`}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium transition-all flex items-center"
                            >
                                <Wallet size={16} className="mr-2" /> Add Funds
                            </Link>
                            <Link
                                to={`/${slug}/dashboard/new-visa`}
                                className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center"
                            >
                                <Plus size={16} className="mr-2" /> New Application
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl"></div>
            </div>

            {/* Use grid with negative margin to pull up into header visually if desired, but here specific spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    subtext="All Time"
                    icon={FileText}
                    color="text-blue-600"
                />
                <StatCard
                    title="Processing"
                    value={stats.pending}
                    subtext="Currently Active"
                    icon={Clock}
                    color="text-orange-600"
                />
                <StatCard
                    title="Approved Visas"
                    value={stats.approved}
                    subtext="Successfully Issued"
                    icon={CheckCircle}
                    color="text-green-600"
                />
                <StatCard
                    title="Visa Rejections"
                    value={stats.rejected}
                    subtext="Action Required"
                    icon={AlertCircle}
                    color="text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Applications Table (2/3) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Plane size={20} />
                            </div>
                            Recent Applications
                        </h3>
                        <Link to={`/${slug}/dashboard/applications`} className="text-sm text-blue-600 font-bold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all flex items-center">
                            View All <ArrowUpRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left tracking-wider">Applicant</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Destination</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentApps.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="text-gray-300" size={32} />
                                                </div>
                                                <p className="font-medium text-gray-900">No applications yet</p>
                                                <p className="text-sm text-gray-400 mt-1">Start a new visa application to see it here.</p>
                                                <Link to={`/${slug}/dashboard/new-visa`} className="mt-4 text-blue-600 font-bold text-sm hover:underline flex items-center">
                                                    <Plus size={16} className="mr-1" /> Create Application
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    recentApps.map((app) => (
                                        <tr key={app._id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-500" onClick={() => {/* Navigate to details? */ }}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm mr-4 shadow-sm group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-700 transition-all">
                                                        {(app.isGroupApplication ? app.groupName : app.applicants[0]?.firstName)?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                            {app.isGroupApplication ? app.groupName : `${app.applicants[0]?.firstName} ${app.applicants[0]?.lastName}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-medium">{app.isGroupApplication ? 'Group App' : 'Individual'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    {/* Ideally show country flag here if available */}
                                                    {app.country?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        app.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.status === 'Approved' ? 'bg-green-500' :
                                                        app.status === 'Rejected' ? 'bg-red-500' :
                                                            app.status === 'Processing' ? 'bg-blue-500' :
                                                                'bg-orange-500'
                                                        }`}></span>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                                {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column (1/3) - Quick Actions / Promo */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                            <TrendingUp size={20} className="text-blue-600 mr-2" />
                            Quick Access
                        </h2>
                        <div className="space-y-3">
                            <Link to={`/${slug}/dashboard/new-visa`} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-all border border-gray-100 hover:border-blue-200 group">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <Plus size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold block text-sm">New Visa Application</span>
                                    <span className="text-xs text-gray-400">Start new process</span>
                                </div>
                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                            </Link>

                            <Link to={`/${slug}/dashboard/wallet`} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition-all border border-gray-100 hover:border-indigo-200 group">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <Wallet size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold block text-sm">Wallet & Transactions</span>
                                    <span className="text-xs text-gray-400">Manage funds</span>
                                </div>
                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-indigo-500" />
                            </Link>
                        </div>
                    </div>

                    {/* Support / Banner */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Need Assistance?</h3>
                            <p className="text-slate-300 text-sm mb-4">Our support team is available 24/7 to help with urgent visa queries.</p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
                                Contact Support
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
