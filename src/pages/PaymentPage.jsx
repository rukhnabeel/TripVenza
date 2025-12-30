import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, QrCode, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const PaymentPage = () => {
    const location = useLocation(); // { payload, countryName, totalAmount }
    const navigate = useNavigate();
    const { payload, countryName, totalAmount } = location.state || {};

    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Wallet'); // 'Wallet', 'UPI', 'Card'
    const [error, setError] = useState(null);

    // Fetch Wallet Balance
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const { data } = await api.get('/auth/me'); // Assuming basic info is in /me or need separate wallet call
                // If /auth/me doesn't return walletBalance, we might need a specific endpoint. 
                // Let's assume /auth/me returns User object which has walletBalance.
                // If not, we'll try /wallet/history but that returns transactions.
                // Let's rely on User object for now.
                setWalletBalance(data.walletBalance || 0);
            } catch (err) {
                console.error("Failed to fetch balance", err);
            }
        };

        // Better way: get balance from a dedicated concise endpoint if available, but Auth context usually has it.
        // Let's assume we can get it from /auth/me re-fetch.
        fetchBalance();
    }, []);

    if (!payload) {
        return <div className="p-8 text-center text-red-500">Invalid Session. Please start a new application.</div>;
    }

    const handlePayment = async () => {
        setError(null);
        setLoading(true);

        try {
            // For Wallet: Balance check happens here (UI) AND Backend
            if (paymentMethod === 'Wallet' && walletBalance < totalAmount) {
                throw new Error(`Insufficient Wallet Balance. Need ₹${totalAmount - walletBalance} more.`);
            }

            // Prepare Final Payload with Payment Method
            // Note: 'payload' from ApplyVisa already contains countryId, visaType, applicants.
            // We append paymentMethod.
            const finalPayload = {
                ...payload,
                paymentMethod: paymentMethod
            };

            // Simulate Gateway Delay for UPI/Card
            if (paymentMethod !== 'Wallet') {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Mock Delay
            }

            const { data } = await api.post('/applications', finalPayload);

            navigate('/dashboard/application-success', {
                state: {
                    applicationId: data.applicationId,
                    countryName: countryName,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    transactionId: data.transactionId // If available
                }
            });

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
                    <p className="text-gray-500">Complete payment for {countryName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Payment Methods */}
                <div className="md:col-span-2 space-y-6">
                    {/* Payment Method Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setPaymentMethod('Wallet')}
                                className={`flex-1 p-4 flex items-center justify-center space-x-2 font-medium transition-colors ${paymentMethod === 'Wallet' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Wallet size={20} />
                                <span>Wallet</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('UPI')}
                                className={`flex-1 p-4 flex items-center justify-center space-x-2 font-medium transition-colors ${paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <QrCode size={20} />
                                <span>UPI QR</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('Card')}
                                className={`flex-1 p-4 flex items-center justify-center space-x-2 font-medium transition-colors ${paymentMethod === 'Card' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <CreditCard size={20} />
                                <span>Card</span>
                            </button>
                        </div>

                        <div className="p-6 min-h-[300px]">
                            {paymentMethod === 'Wallet' && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">Current Balance</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</p>
                                        </div>
                                        {walletBalance < totalAmount ? (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Low Balance</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Sufficient</span>
                                        )}
                                    </div>

                                    {walletBalance < totalAmount && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h4 className="font-semibold text-red-700 text-sm">Insufficient Funds</h4>
                                                <p className="text-red-600 text-xs mt-1">
                                                    Retrieve specific amount is needed. Please Add Funds to your wallet.
                                                </p>
                                                <button onClick={() => navigate('/dashboard/wallet')} className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
                                                    Add Funds
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500">
                                        <p>• Amount will be instantly debited.</p>
                                        <p>• Invoice will be generated automatically.</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'UPI' && (
                                <div className="text-center space-y-6">
                                    <div className="bg-gray-100 p-6 rounded-lg inline-block">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=tripvenza@upi&pn=TripVenza&am=100&cu=INR" alt="UPI QR" className="w-48 h-48 mix-blend-multiply opacity-80" />
                                    </div>
                                    <p className="text-sm text-gray-500">Scan this QR code with any UPI app (GPay, PhonePe, Paytm)</p>
                                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs">
                                        <p className="font-semibold">Mock Payment Gateway</p>
                                        <p>Click "Make Payment" to simulate a successful transaction.</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'Card' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                        <div className="w-full h-12 bg-white border border-gray-300 rounded mb-3 flex items-center px-4 text-gray-400">Card Number</div>
                                        <div className="flex gap-4">
                                            <div className="w-1/2 h-12 bg-white border border-gray-300 rounded flex items-center px-4 text-gray-400">MM/YY</div>
                                            <div className="w-1/2 h-12 bg-white border border-gray-300 rounded flex items-center px-4 text-gray-400">CVC</div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs">
                                        <p className="font-semibold">Mock Payment Interface</p>
                                        <p>We do not store card details. This updates status via secure token.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Service</span>
                                <span className="font-medium text-gray-900">{countryName} Visa</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Applicants</span>
                                <span className="font-medium text-gray-900">{payload.applicants.length}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading || (paymentMethod === 'Wallet' && walletBalance < totalAmount)}
                            className={`w-full mt-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${loading || (paymentMethod === 'Wallet' && walletBalance < totalAmount)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 hover:-translate-y-1'
                                }`}
                        >
                            {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
