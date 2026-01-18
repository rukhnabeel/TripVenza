import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Globe,
    FileText,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
    Wallet
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/tripvenza_logo.png';

const AdminSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Globe, label: 'Visa Products', path: '/admin/dashboard/visas' },
        { icon: FileText, label: 'All Applications', path: '/admin/dashboard/applications' },
        { icon: Wallet, label: 'Wallet Requests', path: '/admin/dashboard/wallet-requests' },
        { icon: Users, label: 'Manage Agents', path: '/admin/dashboard/agents' }, // New Route
        { icon: ShieldCheck, label: 'Verify Documents', path: '/admin/dashboard/documents' },
        { icon: Settings, label: 'Settings', path: '/admin/dashboard/settings' },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6 border-b border-slate-700">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm inline-block mb-2">
                    <img src={logo} alt="TripVenza Admin" className="h-10 w-auto object-contain" />
                </div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Admin Portal
                </h2>
                <div className="mt-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white line-clamp-1">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-slate-400">Platform Owner</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <LogOut size={20} className="mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
