import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';
import { slugify } from '../utils/helpers';
import { Mail, Lock, ArrowRight, AlertCircle, Plane } from 'lucide-react';

const Login = () => {
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
            if (data.user.role === 'admin') {
                setError('Admin accounts must use the Admin Login portal.');
                setLoading(false);
                return;
            } else {
                dispatch(loginSuccess(data));
                const slug = slugify(data.user.agencyName || data.user.name);
                navigate(`/${slug}/dashboard`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-indigo-900/80"></div>

                {/* Decorative Circles */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

                <div className="relative z-10 w-full p-16 flex flex-col justify-between text-white h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                <Plane size={24} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight font-display">TripVenza</span>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight font-display tracking-tight">
                            Elevate Your <br />
                            <span className="text-blue-200">Travel Business</span>
                        </h1>
                        <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">
                            Join the fastest-growing B2B visa platform. Manage applications, payments, and agents all in one place with a premium experience.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-blue-100/60 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            <span>Reliable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            <span>Fast</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            <span>Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-gray-50/30">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
                        <Plane size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 font-display">TripVenza</span>
                </div>

                <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 font-display tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 mt-2 text-base">Log in to access your dashboard.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="mr-3 mt-0.5 shrink-0 text-red-500" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400 hover:border-blue-300/50"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400 hover:border-blue-300/50"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Logging in...' : 'Sign In'}
                            {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-2 transition-all">
                            Register now
                        </Link>
                    </p>
                </div>

                {/* Admin Link Footer */}
                <div className="absolute bottom-8 text-center w-full lg:w-auto left-0 right-0">
                    <Link to="/admin/login" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-2 px-4 rounded-full hover:bg-gray-100">
                        Admin Portal <ArrowRight size={12} className="ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
