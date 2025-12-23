import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, CreditCard } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                TripVenza B2B
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center"
                            >
                                Register as Agent <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-6 border border-blue-100">
                            #1 B2B Visa Platform for Travel Agents
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Simplify Visa Processing with <span className="text-blue-600">Smart Technology</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            One dashboard to manage all your visa applications. Country-wise requirements, real-time tracking, and automated workflows.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all"
                            >
                                View Features
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-24">
                    {[
                        {
                            icon: <Globe className="w-8 h-8 text-blue-600" />,
                            title: "Global Coverage",
                            desc: "Access visa services for over 100+ countries with up-to-date requirements."
                        },
                        {
                            icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />,
                            title: "Secure Verification",
                            desc: "Bank-grade security with OTP tracking and encrypted document storage."
                        },
                        {
                            icon: <CreditCard className="w-8 h-8 text-purple-600" />,
                            title: "Integrated Wallet",
                            desc: "Seamless payments with our prepaid wallet system. Instant refunds and transaction history."
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
