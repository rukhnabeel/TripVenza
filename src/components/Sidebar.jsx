import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Wallet,
    Users,
    Settings,
    LogOut,
    Briefcase,
    ShieldCheck,
    Plane
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'New Application', path: '/dashboard/new-visa' },
        { icon: Briefcase, label: 'My Applications', path: '/dashboard/applications' },
        { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
        { icon: Users, label: 'Sub-Agents', path: '/dashboard/sub-agents' },
        { icon: ShieldCheck, label: 'Verify Documents', path: '/dashboard/documents' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-lg shadow-gray-200/50">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                        <Plane size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            TripVenza
                        </h2>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business</span>
                    </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user?.name || 'Agent'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.agencyName || 'Agency'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar pb-6">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                                )}
                                <item.icon size={20} className={`mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="relative z-10">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 m-4 mt-0 bg-red-50/50 rounded-2xl border border-red-100/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                    <LogOut size={18} className="mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
