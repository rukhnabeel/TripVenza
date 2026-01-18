import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Calendar, MapPin, Wallet, ArrowRight, User } from 'lucide-react';
import tripvenzaLogo from '../assets/tripvenza_logo.png';

const AgentHome = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [destination, setDestination] = useState('');
    const [dates, setDates] = useState({ start: '', end: '' });

    const handleSearch = () => {
        if (destination) {
            navigate(`/dashboard/new-visa?search=${destination}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <img src={tripvenzaLogo} alt="TripVenza" className="h-8 md:h-10 object-contain" />
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                        <Link to="/" className="text-blue-600 font-bold">Apply</Link>
                        <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
                        <span>Need help?</span>
                    </button>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                        <Wallet size={16} className="text-gray-500" />
                        <span className="font-bold text-gray-900 text-sm">₹{user?.walletBalance?.toLocaleString() || 0}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {user?.name?.charAt(0) || <User size={16} />}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-0 relative overflow-hidden">
                {/* Decorative background blob */}
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10 translate-x-1/2"></div>

                <div className="text-center max-w-3xl mx-auto mb-10 z-10 md:-mt-20">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        Best Prices, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pb-2 border-b-4 border-purple-200">Effortless</span> Bookings
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-6 relative z-10">
                    <div className="flex gap-8 border-b border-gray-200 w-full max-w-lg justify-center pb-2">
                        {/* Mock Tabs for visual fidelity */}
                        <button className="flex items-center gap-2 pb-2 text-gray-400 font-medium hover:text-gray-600 transition-colors">
                            <span>Insurance Marketplace</span>
                        </button>
                        <button className="flex items-center gap-2 pb-2 border-b-2 border-blue-600 text-blue-600 font-bold">
                            <span>Visas</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar Container */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-2 md:p-3 flex flex-col md:flex-row gap-2 relative z-20">
                    {/* Destination Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <MapPin size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Where to?"
                            className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">COUNTRY</span>
                    </div>

                    {/* Date Inputs (Visual mostly) */}
                    <div className="hidden md:flex gap-2 w-full md:w-auto">
                        <button className="h-14 px-4 bg-gray-50 rounded-xl flex items-center gap-3 text-gray-500 border-0 hover:bg-gray-100 transition-colors min-w-[160px]">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Travel Date</span>
                        </button>
                        <button className="h-14 px-4 bg-gray-50 rounded-xl flex items-center gap-3 text-gray-500 border-0 hover:bg-gray-100 transition-colors min-w-[160px]">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Return Date</span>
                        </button>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="h-14 w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Search size={20} />
                        <span>Search</span>
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-12 mt-auto">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-blue-200 font-medium mb-8">
                        Have visas in bulk? Call our account manager to get best rates: <span className="text-white font-bold ml-1">+91 000 000 0000</span>
                    </p>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300/60 gap-4">
                        <p>© 2026 TripVenza Business. All rights reserved.</p>
                        <div className="flex gap-6">
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                            <span>Support</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AgentHome;
