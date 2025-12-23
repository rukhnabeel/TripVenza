import React, { useState } from 'react';
import { Search, Filter, Download, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const ApplicationRow = ({ id, name, passport, country, type, date, status, amount }) => {
    const statusStyles = {
        Pending: 'bg-orange-100 text-orange-700 border-orange-200',
        Approved: 'bg-green-100 text-green-700 border-green-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
        Processing: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group">
            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                #{id}
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">{passport}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-6 text-sm text-gray-600">{country}</td>
            <td className="py-4 px-6 text-sm text-gray-600">{type}</td>
            <td className="py-4 px-6 text-sm text-gray-500">{date}</td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-6 text-sm font-medium text-gray-900">₹{amount}</td>
            <td className="py-4 px-6 text-right">
                <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                    <MoreHorizontal size={18} />
                </button>
            </td>
        </tr>
    );
};

const Applications = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const applications = [
        { id: '1001', name: 'Rahul Sharma', passport: 'A1234567', country: 'UAE', type: 'Tourist 30 Days', date: 'Oct 24, 2024', status: 'Processing', amount: '6,500' },
        { id: '1002', name: 'Anjali Gupta', passport: 'B9876543', country: 'Singapore', type: 'Tourist 30 Days', date: 'Oct 23, 2024', status: 'Approved', amount: '2,800' },
        { id: '1003', name: 'Vikram Singh', passport: 'C4567890', country: 'Thailand', type: 'Tourist Visa', date: 'Oct 23, 2024', status: 'Pending', amount: '3,200' },
        { id: '1004', name: 'Sneha Patel', passport: 'D1230987', country: 'Malaysia', type: 'E-Visa 30 Days', date: 'Oct 22, 2024', status: 'Rejected', amount: '1,500' },
        { id: '1005', name: 'Mohammed Ali', passport: 'E5678901', country: 'Saudi Arabia', type: 'Umrah Visa', date: 'Oct 21, 2024', status: 'Approved', amount: '12,000' },
        { id: '1006', name: 'Priya Desai', passport: 'F6789012', country: 'Vietnam', type: 'Tourist 30 Days', date: 'Oct 20, 2024', status: 'Approved', amount: '2,100' },
        { id: '1007', name: 'Arjun Kumar', passport: 'G7890123', country: 'Azerbaijan', type: 'Standard Visa', date: 'Oct 19, 2024', status: 'Processing', amount: '1,800' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-500 mt-1">Track and manage all your visa applications.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Filter size={18} className="mr-2" />
                        Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Download size={18} className="mr-2" />
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, passport, or ID..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">App ID</th>
                                <th className="py-4 px-6 font-semibold">Applicant</th>
                                <th className="py-4 px-6 font-semibold">Country</th>
                                <th className="py-4 px-6 font-semibold">Visa Type</th>
                                <th className="py-4 px-6 font-semibold">Date</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Amount</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <ApplicationRow key={app.id} {...app} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">Showing 1-7 of 156 applications</div>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Applications;
