import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const AdminWalletRequests = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector(state => state.auth);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [token]); // Initial load only, manual filter apply thereafter or we can add deps

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Build Query Params
            const params = new URLSearchParams();
            if (statusFilter !== 'All') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const { data } = await api.get(`/wallet/requests?${params.toString()}`);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStatusFilter('All');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        // We need to call fetchTransactions after state update, but state update is async.
        // Simplest way is to reload page or use a useEffect for these values if we wanted auto-fetch.
        // For now, let's just clear and user hits Apply, or we simply reload the "initial" state.
        // Better: trigger a fetch with empty params directly.
        fetchTransactionsWithParams({}, true);
    };

    // Helper to fetch with overridden params - avoiding state update race conditions for Reset
    const fetchTransactionsWithParams = async (overrides = {}, reset = false) => {
        setLoading(true);
        try {
            if (reset) {
                setStatusFilter('All');
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
            }

            const params = new URLSearchParams();
            if (!reset) {
                if (statusFilter !== 'All') params.append('status', statusFilter);
                if (searchTerm) params.append('search', searchTerm);
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
            }

            const { data } = await api.get(`/wallet/requests?${params.toString()}`);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleVerify = async (id, status, remarks = '') => {
        if (!window.confirm(`Are you sure you want to ${status} this transaction?`)) return;

        try {
            await api.patch(`/wallet/${id}/verify`, { status, remarks });
            fetchTransactions();
            alert(`Transaction ${status} Successfully`);
        } catch (error) {
            console.error('Error verifying:', error);
            alert('Verification Failed');
        }
    };

    const statusStyles = {
        Pending: 'bg-orange-100 text-orange-700 border-orange-200',
        Success: 'bg-green-100 text-green-700 border-green-200',
        Failed: 'bg-red-100 text-red-700 border-red-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wallet Requests</h1>
                    <p className="text-gray-500 mt-1">Verify manual UPI deposits submitted by agents.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="UTR, Name, or Agency..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-48">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Success">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="w-full md:w-auto">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pb-0.5">
                    <button
                        onClick={() => fetchTransactions()}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Apply
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Agent</th>
                                <th className="py-4 px-6 font-semibold">UTR Number</th>
                                <th className="py-4 px-6 font-semibold">Amount</th>
                                <th className="py-4 px-6 font-semibold">Date</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No requests found matching criteria</td></tr>
                            ) : transactions.map((txn) => (
                                <tr key={txn._id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900">{txn.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{txn.user?.agencyName}</div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-700 font-mono text-sm">{txn.utrNumber || '-'}</td>
                                    <td className="py-4 px-6 font-bold text-gray-900">₹{txn.amount}</td>
                                    <td className="py-4 px-6 text-gray-500 text-sm">
                                        {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[txn.status] || 'bg-gray-100'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {txn.status === 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(txn._id, 'Approved')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip border border-transparent hover:border-green-200"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(txn._id, 'Rejected')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg tooltip border border-transparent hover:border-red-200"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {txn.status !== 'Pending' && (
                                            <span className="text-xs text-gray-400 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminWalletRequests;
