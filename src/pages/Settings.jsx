import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Lock, Globe, Building, Server, Shield, Mail } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../utils/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);

    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        sms: true,
        whatsapp: true,
        applicationUpdates: true,
        marketing: false
    });

    // Fetch initial notification settings
    useEffect(() => {
        if (user?.notifications) {
            setNotificationSettings(user.notifications);
        }
    }, [user]);

    const handleNotificationChange = async (key) => {
        const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
        setNotificationSettings(newSettings); // Optimistic update

        try {
            await api.put('/users/profile/notifications', newSettings);
        } catch (error) {
            console.error('Failed to update notifications:', error);
            setNotificationSettings({ ...notificationSettings }); // Revert
        }
    };

    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: user?.phone || '',
        agencyName: user?.agencyName || '',
        agencyAddress: user?.address?.street || ''
    });

    // Update form when user data changes (e.g. after refresh)
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ')[1] || '',
                email: user.email || '',
                phone: user.phone || '',
                agencyName: user.agencyName || '',
                agencyAddress: user.address?.street || ''
            });
        }
    }, [user]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert('File size exceeds 1MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            const { data } = await api.post('/users/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(loginSuccess({
                user: { ...user, avatar: data.avatar },
                token: localStorage.getItem('token')
            }));

            alert('Avatar updated successfully!');
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {


            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const payload = {
                name: fullName,
                email: formData.email,
                phone: formData.phone,
                agencyName: formData.agencyName,
                address: formData.agencyAddress
            };

            const { data } = await api.put('/users/profile', payload);

            dispatch(loginSuccess({ user: data, token: localStorage.getItem('token') }));

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSavePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.put('/users/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password update failed:', error);
            alert(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'agency', label: 'Agency Details', icon: Building },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">Settings</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage platform configuration and your account.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* Sidebar */}
                <div className="w-full md:w-72 border-r border-gray-100 bg-gray-50/50 p-6">
                    <div className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50'
                                    }`}
                            >
                                <tab.icon size={18} className={`mr-3 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-blue-200' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-10">
                    {/* --- Profile Tab --- */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Your Profile</h3>
                                <p className="text-sm text-gray-500">Update your photo and personal details.</p>
                            </div>

                            <div className="flex items-center gap-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="relative group shrink-0">
                                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shadow-gray-200">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-blue-600 text-4xl font-black font-display">
                                                {formData.firstName[0]}{formData.lastName[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                                        <User className="text-white" size={32} />
                                    </div>
                                </div>
                                <div>
                                    <label className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer inline-flex items-center shadow-sm">
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                        Change Avatar
                                    </label>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">JPG or PNG. Max 1MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Agency Tab --- */}                            {/* --- Agency Tab --- */}
                    {activeTab === 'agency' && (
                        <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Agency Details</h3>
                                <p className="text-sm text-gray-500">Manage your business information.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Name</label>
                                <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Address</label>
                                <textarea rows="4" name="agencyAddress" value={formData.agencyAddress} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm resize-none" />
                            </div>
                        </div>
                    )}


                    {/* --- Notifications Tab --- */}
                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h3>
                                <p className="text-sm text-gray-500">Control how we contact you.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { id: 'sms', label: 'SMS Alerts', desc: 'Get important alerts via SMS' },
                                    { id: 'whatsapp', label: 'WhatsApp Updates', desc: 'Receive updates on WhatsApp' }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.label}</h4>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings[item.id]}
                                                onChange={() => handleNotificationChange(item.id)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- Security Tab --- */}
                    {activeTab === 'security' && (
                        <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h3>
                                <p className="text-sm text-gray-500">Protect your account.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-gray-100 mt-10 flex justify-end">
                        <button
                            onClick={activeTab === 'security' ? handleSavePassword : handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 flex items-center group"
                        >
                            <Save size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                            {loading ? 'Saving...' : activeTab === 'security' ? 'Update Password' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
