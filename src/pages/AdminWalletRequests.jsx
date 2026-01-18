import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Filter, CheckCircle, XCircle, Clock, Wallet, ArrowUpRight } from 'lucide-react';
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
    }, [token]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
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
        fetchTransactionsWithParams({}, true);
    };

    const fetchTransactionsWithParams = async (overrides = {}, reset = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (!reset) {
                if (statusFilter !== 'All') params.append('status', statusFilter);
                if (searchTerm) params.append('search', searchTerm);
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
        Pending: 'bg-amber-50 text-amber-700 border-amber-100',
        Success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        Failed: 'bg-rose-50 text-rose-700 border-rose-100',
        Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    };

    const pendingCount = transactions.filter(t => t.status === 'Pending').length;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-teal-800 to-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Wallet size={24} className="text-teal-200" />
                            </div>
                            <h1 className="text-3xl font-bold">Wallet Requests</h1>
                        </div>
                        <p className="text-teal-100/90 max-w-lg">
                            Verify and approve manual fund deposit requests from agents to top up their wallets.
                        </p>
                    </div>
                    {/* Quick Stats in Header */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl min-w-[140px]">
                            <p className="text-xs text-teal-200 uppercase font-bold tracking-wider">Pending Action</p>
                            <p className="text-3xl font-bold text-white mt-1">{pendingCount}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-end">
                <div className="flex-1 min-w-[240px]">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Search Request</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by UTR, Name, or Agency..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full lg:w-48">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Status</label>
                    <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-gray-700 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Success">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="w-full lg:w-auto flex gap-2">
                    <button
                        onClick={() => fetchTransactions()}
                        className="flex-1 lg:flex-none px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                    >
                        <Filter size={18} />
                        Apply
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Agent Details</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Info</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-gray-500">Loading requests...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                                <Wallet size={24} />
                                            </div>
                                            <p className="font-medium">No wallet requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.map((txn) => (
                                <tr key={txn._id} className="hover:bg-teal-50/30 transition-colors border-b border-gray-100 last:border-0 group">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-gray-900">{txn.user?.agencyName || 'Unknown Agency'}</div>
                                        <div className="text-xs text-gray-500">{txn.user?.name}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-600 mb-1">
                                            UTR: {txn.utrNumber || 'N/A'}
                                        </div>
                                        {txn.paymentMethod && <div className="text-xs text-gray-400">{txn.paymentMethod}</div>}
                                    </td>
                                    <td className="py-4 px-6 font-bold text-gray-900 text-lg">₹{txn.amount?.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-gray-500 text-sm">
                                        {new Date(txn.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        <span className="text-xs text-gray-400 block">{new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[txn.status] || 'bg-gray-100'}`}>
                                            {txn.status === 'Pending' && <Clock size={12} className="mr-1.5" />}
                                            {txn.status === 'Success' && <CheckCircle size={12} className="mr-1.5" />}
                                            {txn.status === 'Rejected' && <XCircle size={12} className="mr-1.5" />}
                                            {txn.status === 'Success' ? 'Approved' : txn.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {txn.status === 'Pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(txn._id, 'Approved')}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(txn._id, 'Rejected')}
                                                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Processed</span>
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
