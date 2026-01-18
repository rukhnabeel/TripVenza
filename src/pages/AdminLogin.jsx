import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, LayoutDashboard } from 'lucide-react';
import logo from '../assets/tripvenza_logo.png';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                email: formData.email.trim(),
                password: formData.password.trim()
            };
            const { data } = await api.post('/auth/login', payload);

            if (data.user.role !== 'admin') {
                setError('Access denied. This portal is for administrators only.');
                setLoading(false);
                return;
            }

            dispatch(loginSuccess(data));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* Left Side - Context */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/40"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                        <LayoutDashboard size={32} className="text-blue-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">Admin & <br />Operations</h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Secure gateway for managing visa applications, agent networks, and financial transactions.
                    </p>
                    <div className="flex gap-4 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> System Operational
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> v2.4.0 (Latest)
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
                <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
                    <div className="text-center">
                        <img src={logo} alt="TripVenza" className="h-12 w-auto mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900">Admin Authentication</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please verify your identity to access the backend.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start text-sm shadow-sm">
                            <AlertCircle size={18} className="mr-3 mt-0.5 shrink-0 text-red-500" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Admin Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="admin@tripvenza.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-gray-900/10 text-sm font-bold text-white bg-gray-900 hover:bg-black hover:shadow-gray-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
                            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Return to Agent Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
