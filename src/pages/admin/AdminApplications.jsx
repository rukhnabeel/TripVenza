import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../../store/slices/applicationsSlice';
import { Search, Filter, Eye, Download, ChevronLeft, ChevronRight, Inbox, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminApplications = () => {
    const dispatch = useDispatch();
    const { list, pagination, loading } = useSelector(state => state.applications);

    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        country: 'All',
        page: 1,
        limit: 10
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchApplications(filters));
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, dispatch]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Calculate quick stats from current view (or ideal would be separate API)
    const stats = useMemo(() => {
        const total = pagination?.totalCount || 0;
        // These are just approximate based on loaded list if we don't have global stats
        // For a real admin dashboard, you'd fetch these separately
        return { total };
    }, [pagination]);

    const tabs = ['All', 'Pending', 'Processing', 'Approved', 'Rejected'];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Inbox size={24} className="text-blue-200" />
                            </div>
                            <h1 className="text-3xl font-bold">Applications</h1>
                        </div>
                        <p className="text-gray-300 max-w-lg">
                            Manage and review all visa applications submitted by agencies.
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                                {pagination?.totalCount || 0} Total
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10 overflow-x-auto max-w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleFilterChange('status', tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filters.status === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID, applicant name, or passport..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none text-gray-600 cursor-pointer hover:bg-gray-50 transition-all font-medium"
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                    >
                        <option value="All">All Countries</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Thailand">Thailand</option>
                        {/* Dynamic list ideally */}
                    </select>

                    <button className="flex items-center px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Download size={18} className="mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Premium Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Application</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Agency</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-gray-500 font-medium">Loading applications...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Inbox className="text-gray-300" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No applications found</h3>
                                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                list.map((app) => {
                                    const mainApplicant = app.applicants?.[0];
                                    const displayName = app.isGroupApplication ? app.groupName : `${mainApplicant?.firstName} ${mainApplicant?.lastName}`;

                                    return (
                                        <tr key={app._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-transform group-hover:scale-105 ${app.isGroupApplication
                                                            ? 'bg-purple-100 text-purple-600'
                                                            : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {displayName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            {displayName}
                                                            {app.isGroupApplication && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold tracking-wide">GROUP</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">#{app.applicationId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="font-medium text-gray-900">{app.country?.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{app.visaType}</div>
                                            </td>
                                            <td className="py-5 px-6">
                                                {app.agent ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{app.agent.agencyName}</div>
                                                        <div className="text-xs text-gray-400">{app.agent.name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unknown Agent</span>
                                                )}
                                            </td>
                                            <td className="py-5 px-6 text-sm text-gray-500">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                            app.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {app.status === 'Approved' && <CheckCircle size={12} className="mr-1.5" />}
                                                    {app.status === 'Rejected' && <XCircle size={12} className="mr-1.5" />}
                                                    {['Pending', 'Processing', 'Submitted'].includes(app.status) && <Clock size={12} className="mr-1.5" />}
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <Link
                                                    to={`/admin/dashboard/applications/${app._id}`}
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                                >
                                                    <Eye size={16} className="mr-2" /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="text-sm text-gray-500">
                        Page <span className="font-bold">{pagination.currentPage}</span> of <span className="font-bold">{pagination.totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-white hover:shadow-sm transition-all bg-white disabled:bg-transparent"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-white hover:shadow-sm transition-all bg-white disabled:bg-transparent"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminApplications;
