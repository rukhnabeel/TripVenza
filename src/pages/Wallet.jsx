import React, { useState, useEffect } from 'react';
import { CreditCard, History, Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, Download, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Wallet = () => {
    const { user } = useSelector(state => state.auth);
    const [balance, setBalance] = useState(user?.walletBalance || 0);
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (user) {
            setBalance(user.walletBalance || 0);
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        try {
            const { data } = await api.get('/wallet/history');
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch wallet info');
        }
    };

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount || amount < 100) {
            alert('Minimum amount is ₹100');
            return;
        }

        setLoading(true);
        try {
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                alert('Razorpay SDK failed to load.');
                setLoading(false);
                return;
            }

            const { data: order } = await api.post('/payment/create-order', { amount: Number(amount) });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "TripVenza Holidays",
                description: "Wallet Top-up",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: Number(amount)
                        });

                        if (verifyRes.data.success) {
                            setAmount('');
                            fetchWalletData();
                        }
                    } catch (err) {
                        alert('Payment Verification Failed!');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: "#2563EB" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = filter === 'All' ? history : history.filter(txn => txn.type === filter);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight">Wallet & Payments</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Manage your funds and track transaction history.</p>
                </div>
                <button className="hidden md:flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all hover:-translate-y-0.5">
                    <Download size={18} className="mr-2" /> Download Statement
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Balance & Top-up */}
                <div className="space-y-8">
                    {/* Balance Card */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl shadow-blue-900/20 group transform transition-all hover:scale-[1.01]">
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-700"></div>
                        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>

                        <div className="relative z-10 flex flex-col justify-between h-56">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                    <WalletIcon size={24} className="text-blue-200" />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-1">Current Balance</p>
                                    <h2 className="text-5xl font-black tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                        ₹{balance.toLocaleString()}
                                    </h2>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-slate-400 text-sm font-medium">Account Holder</p>
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div> Active
                                    </span>
                                </div>
                                <div className="flex justify-between items-end bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <p className="font-bold text-lg tracking-wide text-slate-100">{user?.agencyName || user?.name}</p>
                                    <p className="text-sm text-slate-500 font-mono tracking-wider">**** 4242</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Funds */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                                    <Plus size={20} />
                                </span>
                                Add Funds
                            </h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Secured by Razorpay</span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar mb-4">
                            {[1000, 2000, 5000, 10000].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap active:scale-95"
                                >
                                    + ₹{val.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleAddFunds} className="space-y-5">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block group-focus-within:text-blue-600 transition-colors">Amount to Add</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl group-focus-within:text-blue-600 transition-colors">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-2xl text-gray-900 outline-none placeholder-gray-300"
                                        placeholder="0"
                                        min="100"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-gray-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex justify-center items-center group"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Proceed to Pay <ArrowUpRight size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Transactions */}
                <div className="xl:col-span-2 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl flex items-center">
                                <History size={22} className="text-blue-500 mr-2" />
                                Recent Transactions
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">View your recent wallet activity.</p>
                        </div>

                        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                            {['All', 'Credit', 'Debit'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 h-[600px] overflow-y-auto custom-scrollbar p-2">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead className="bg-white text-xs text-gray-400 uppercase font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-left">Date & Time</th>
                                    <th className="px-6 py-4 text-left">Reference ID</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                                    <History size={32} />
                                                </div>
                                                <p className="text-gray-500 font-medium">No transactions found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((txn, idx) => (
                                        <motion.tr
                                            key={txn._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-blue-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 bg-white border-y border-l border-gray-100 rounded-l-2xl group-hover:border-blue-100 group-hover:bg-blue-50/30">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm ${txn.type === 'Credit' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        {txn.type === 'Credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{txn.description}</p>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${txn.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} mt-1 inline-block`}>
                                                            {txn.status || 'Success'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-white border-y border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">{new Date(txn.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{new Date(txn.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-white border-y border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                                    {txn._id.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black text-sm bg-white border-y border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 ${txn.type === 'Credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {txn.type === 'Credit' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500 font-bold bg-white border-y border-r border-gray-100 rounded-r-2xl group-hover:border-blue-100 group-hover:bg-blue-50/30">
                                                ₹{txn.balanceAfter ? txn.balanceAfter.toLocaleString() : '-'}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
