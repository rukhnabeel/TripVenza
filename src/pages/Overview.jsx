import React from 'react';
import { ArrowUpRight, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium flex items-center">
                <TrendingUp size={16} className="mr-1" />
                {change}
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
        </div>
    </div>
);

const RecentApplication = ({ name, passport, country, status, date }) => {
    const statusColors = {
        Pending: 'bg-orange-100 text-orange-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
        Processing: 'bg-blue-100 text-blue-700',
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            <td className="py-4 px-4">
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500">{passport}</div>
            </td>
            <td className="py-4 px-4 text-gray-600">{country}</td>
            <td className="py-4 px-4 text-gray-500">{date}</td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-4 text-right">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
            </td>
        </tr>
    );
};

const Overview = () => {
    const { user } = useSelector(state => state.auth);
    const walletBalance = user?.walletBalance || 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <Link to="/dashboard/new-visa" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center">
                    <ArrowUpRight size={20} className="mr-2" />
                    New Application
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Wallet Balance"
                    value={`₹${walletBalance.toLocaleString()}`}
                    change="+12.5%"
                    icon={DollarSign}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    title="Pending Visas"
                    value="12"
                    change="+4.2%"
                    icon={Clock}
                    color="bg-gradient-to-br from-orange-400 to-red-500"
                />
                <StatCard
                    title="Approved Today"
                    value="4"
                    change="+8.1%"
                    icon={CheckCircle}
                    color="bg-gradient-to-br from-green-400 to-emerald-600"
                />
                <StatCard
                    title="Rejected (Mo.)"
                    value="1"
                    change="-2.5%"
                    icon={XCircle}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 text-lg">Recent Applications</h2>
                        <Link to="/dashboard/applications" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">Applicant</th>
                                    <th className="py-3 px-4 font-semibold">Country</th>
                                    <th className="py-3 px-4 font-semibold">Applied Date</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <RecentApplication name="Rahul Sharma" passport="A1234567" country="UAE" status="Processing" date="Oct 24, 2024" />
                                <RecentApplication name="Anjali Gupta" passport="B9876543" country="Singapore" status="Approved" date="Oct 23, 2024" />
                                <RecentApplication name="Vikram Singh" passport="C4567890" country="Thailand" status="Pending" date="Oct 23, 2024" />
                                <RecentApplication name="Sneha Patel" passport="D1230987" country="Malaysia" status="Rejected" date="Oct 22, 2024" />
                                <RecentApplication name="Mohammed Ali" passport="E5678901" country="Saudi Arabia" status="Approved" date="Oct 21, 2024" />
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md mr-4">
                                <DollarSign size={20} className="text-green-600" />
                            </div>
                            <div>
                                <span className="block font-medium">Add Funds</span>
                                <span className="text-xs text-gray-500 group-hover:text-blue-600">Recharge wallet via UPI/Netbanking</span>
                            </div>
                        </button>
                        <button className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md mr-4">
                                <Clock size={20} className="text-orange-600" />
                            </div>
                            <div>
                                <span className="block font-medium">Check E-Visa Status</span>
                                <span className="text-xs text-gray-500 group-hover:text-blue-600">Track pending applications</span>
                            </div>
                        </button>
                        <button className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md mr-4">
                                <TrendingUp size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <span className="block font-medium">Download Reports</span>
                                <span className="text-xs text-gray-500 group-hover:text-blue-600">Monthly business statements</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
