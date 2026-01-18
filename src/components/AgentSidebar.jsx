import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { slugify } from '../utils/helpers';
import {
    LayoutDashboard,
    FileText,
    Wallet,
    Users,
    Settings,
    LogOut,
    Briefcase,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../store/slices/authSlice';

const AgentSidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const isApproved = user?.kycStatus === 'Approved';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const slug = slugify(user?.agencyName || user?.name || 'agent');
    const basePath = `/${slug}/dashboard`;

    // Base items always visible
    const baseItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${basePath}`, exact: true },
        { icon: ShieldCheck, label: 'Verify Documents', path: `${basePath}/documents`, exact: false },
        { icon: Settings, label: 'Settings', path: `${basePath}/settings`, exact: false },
    ];

    // Restricted items
    const restrictedItems = [
        { icon: FileText, label: 'New Application', path: `${basePath}/new-visa` },
        { icon: Briefcase, label: 'My Applications', path: `${basePath}/applications` },
        { icon: Wallet, label: 'Wallet', path: `${basePath}/wallet` },
        { icon: Users, label: 'Sub-Agents', path: `${basePath}/sub-agents` },
    ];

    return (
        <>
            <div className={`
                w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 z-30
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                <div className="p-6 border-b border-gray-100 flex justify-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{user?.name || 'Agent'}</p>
                            <p className="text-xs text-gray-500">
                                Status: <span className={isApproved ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                                    {user?.kycStatus || 'Pending'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                    {baseItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon size={20} className="mr-3" />
                            {item.label}
                        </NavLink>
                    ))}

                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Services</p>
                    {restrictedItems.map((item) => (
                        isApproved ? (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon size={20} className="mr-3" />
                                {item.label}
                            </NavLink>
                        ) : (
                            <div key={item.path} className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed opacity-60">
                                <Lock size={20} className="mr-3" />
                                {item.label}
                            </div>
                        )
                    ))}

                    {!isApproved && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                            Complete your KYC verification in "Verify Documents" to unlock all features.
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default AgentSidebar;
