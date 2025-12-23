import React, { useState, useEffect } from 'react';
import { CreditCard, History, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';

const Wallet = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector(state => state.auth);
    const [balance, setBalance] = useState(user?.walletBalance || 0);
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setBalance(user?.walletBalance || 0);
        fetchWalletData();
    }, [user]);

    const fetchWalletData = async () => {
        try {
            const { data } = await api.get('/wallet/history');
            setHistory(data);
            if (data.length > 0) {
                setBalance(data[0].balanceAfter);
            }
        } catch (error) {
            console.error('Failed to fetch wallet info');
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount) return;
        setLoading(true);
        try {
            const { data } = await api.post('/wallet/add', { amount: Number(amount) });
            setBalance(data.newBalance);

            // Update Redux store with new balance
            dispatch(loginSuccess({
                user: { ...user, walletBalance: data.newBalance },
                token
            }));

            setAmount('');
            fetchWalletData(); // Refresh history
            alert('Money Added Successfully!');
        } catch (error) {
            alert('Transaction Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <p className="text-blue-100 font-medium mb-1">Available Balance</p>
                    <h2 className="text-4xl font-bold mb-6">₹{balance.toLocaleString()}</h2>
                    <div className="flex space-x-4">
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center transition-colors">
                            <History size={18} className="mr-2" /> History
                        </button>
                    </div>
                </div>

                {/* Add Money */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Plus size={20} className="mr-2 text-blue-600" /> Add Money
                    </h3>
                    <form onSubmit={handleAddFunds} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Amount (INR)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg"
                                placeholder="5000"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-colors"
                        >
                            {loading ? 'Processing...' : 'Add to Wallet'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions yet</div>
                    ) : (
                        history.map((txn) => (
                            <div key={txn._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${txn.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {txn.type === 'Credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{txn.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${txn.type === 'Credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount}
                                    </p>
                                    <p className="text-xs text-gray-400">Bal: ₹{txn.balanceAfter}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
