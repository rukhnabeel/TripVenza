import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Clock, Zap, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import logo from '../assets/tripvenza_logo.png';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="TripVenza" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors px-4 py-2">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all hover:shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-50 to-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 -z-10"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            #1 Visa Platform for Travel Agents
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight font-display">
                            Best Prices, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Effortless Bookings</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
                            Boost your agency's revenue with regular commissions, <span className="font-bold text-gray-900">99.9% on-time approvals</span>, and a dashboard designed for speed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Start Applying Now <ArrowRight size={20} />
                            </Link>
                            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <Play size={20} className="fill-gray-700" /> Watch Demo
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" /> No Setup Fees
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" /> Instant Activation
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" /> 24/7 Support
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[3rem] rotate-3 opacity-10 blur-2xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1546519638-68e109498ee3?q=80&w=2690&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="relative rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border-8 border-white object-cover h-[600px] w-full"
                        />

                        {/* Floating Cards */}
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: -20 }}
                            transition={{ repeat: Infinity, duration: 3, repeatType: "reverse", ease: "easeInOut" }}
                            className="absolute top-10 -left-10 bg-white p-5 rounded-2xl shadow-xl shadow-gray-200 border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Visa Status</p>
                                    <p className="font-bold text-gray-900">Approved</p>
                                </div>
                            </div>
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-green-500 rounded-full"></div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 20 }}
                            transition={{ repeat: Infinity, duration: 4, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-20 -right-10 bg-white p-5 rounded-2xl shadow-xl shadow-gray-200 border border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Wallet Balance</p>
                                    <p className="font-black text-xl text-gray-900">₹85,400</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                    <Zap size={24} className="fill-white" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Stats */}
            <section className="py-12 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
                    <div>
                        <p className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">99.9%</p>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Approval Rate</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">30s</p>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Processing Speed</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">100+</p>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Countries</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">24/7</p>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Expert Support</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Why Choose TripVenza?</span>
                        <h2 className="text-4xl font-black text-gray-900 mt-3 mb-6">Designed for Modern Travel Agencies</h2>
                        <p className="text-lg text-gray-500">Stop wrestling with complicated government portals. We provide a single, unified interface for all your visa needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Globe, title: 'Global Coverage', desc: 'Apply for visas for over 100+ countries with a single account.' },
                            { icon: Clock, title: 'Real-time Tracking', desc: 'Live updates on your application status. No more guessing games.' },
                            { icon: Shield, title: 'Data Security', desc: 'Bank-grade encryption ensures your client data is always safe.' },
                            { icon: Zap, title: 'Instant Refunds', desc: 'Rejected? Get instant refunds directly to your wallet.' },
                            { icon: CheckCircle2, title: 'Automated Checks', desc: 'Our OCR catches errors before submission to prevent rejection.' },
                            { icon: ArrowRight, title: 'High Commission', desc: 'Earn industry-leading commissions on every successful application.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-blue-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-50 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to scale your business?</h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join 500+ travel agents who trust TripVenza for their visa processing needs.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="px-10 py-4 bg-white text-blue-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">
                                Register as Agent
                            </Link>
                            <Link to="/login" className="px-10 py-4 bg-blue-800 text-white border border-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors">
                                Agent Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center opacity-60 text-sm">
                        <p>© 2026 TripVenza. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-900">Terms of Service</a>
                            <a href="#" className="hover:text-gray-900">Contact Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
