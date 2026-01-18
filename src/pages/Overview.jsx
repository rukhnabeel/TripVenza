import React, { useEffect, useState } from 'react';
import {
    FileText,
    Wallet,
    CheckCircle,
    Clock,
    Plus,
    ArrowUpRight,
    Search,
    TrendingUp,
    AlertCircle,
    Plane,
    BarChart2,
    MoreVertical,
    ChevronRight,
    Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { slugify } from '../utils/helpers';
import { Loader } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>
                <Icon size={22} />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    <TrendingUp size={12} className="mr-1" /> {trendValue}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{value}</h3>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
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
                const { data } = await api.get('/applications?limit=100');
                const apps = data.applications || [];

                const total = data.totalCount || apps.length;
                const approved = apps.filter(app => app.status === 'Approved').length;
                const pending = apps.filter(app => app.status === 'Submitted' || app.status === 'Processing').length;
                const rejected = apps.filter(app => app.status === 'Rejected').length;

                setStats({ total, approved, pending, rejected });
                setRecentApps(apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
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
            <div className="flex h-96 items-center justify-center">
                <Loader className="animate-spin text-gray-900" size={32} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/${slug}/dashboard/new-visa`}
                        className="flex items-center px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="mr-2" />
                        New Application
                    </Link>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon={FileText}
                    color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                    trend="up"
                    trendValue="12%"
                />
                <StatCard
                    title="Visas Approved"
                    value={stats.approved}
                    icon={CheckCircle}
                    color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                    trend="up"
                    trendValue="98% rate"
                />
                <StatCard
                    title="Processing"
                    value={stats.pending}
                    icon={Clock}
                    color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                />
                <StatCard
                    title="Wallet Balance"
                    value={`₹${user?.walletBalance?.toLocaleString() || 0}`}
                    icon={Wallet}
                    color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Recent Applications (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Recent Applications</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Latest visa updates</p>
                            </div>
                            <Link
                                to={`/${slug}/dashboard/applications`}
                                className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                            >
                                View All <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentApps.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-gray-400 font-medium text-sm">
                                                No recent applications found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentApps.map((app) => (
                                            <tr key={app._id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs mr-3">
                                                            {(app.isGroupApplication ? app.groupName : app.applicants[0]?.firstName)?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">
                                                                {app.isGroupApplication ? app.groupName : `${app.applicants[0]?.firstName} ${app.applicants[0]?.lastName}`}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{app.isGroupApplication ? 'Group' : 'Individual'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        {app.country?.name}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                app.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Quick Actions & Wallet (1/3 width) */}
                <div className="space-y-6">
                    {/* Wallet Widget */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Wallet size={20} className="text-blue-300" />
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-300">
                                    Wallet
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Available Balance</p>
                            <h3 className="text-3xl font-black tracking-tight mb-6">₹{user?.walletBalance?.toLocaleString() || 0}</h3>

                            <Link
                                to={`/${slug}/dashboard/wallet`}
                                className="w-full flex items-center justify-center py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors"
                            >
                                <Plus size={16} className="mr-2" /> Add Funds
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to={`/${slug}/dashboard/new-visa`} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <Plane size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Check Visa Requirements</h4>
                                    <p className="text-xs text-gray-500">Search by country</p>
                                </div>
                            </Link>
                            <Link to={`/${slug}/dashboard/settings`} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Verify Documents</h4>
                                    <p className="text-xs text-gray-500">Compliance & KYC</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Help/Support Teaser */}
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-center">
                        <p className="font-bold text-blue-900 text-sm mb-1">Need help with an application?</p>
                        <p className="text-xs text-blue-600/80 mb-3">Our support team is available 24/7.</p>
                        <button className="text-blue-700 text-xs font-bold hover:underline">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
