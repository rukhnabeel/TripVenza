import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateApplicationStatus } from '../../store/slices/applicationsSlice';
import api from '../../utils/api';
import { ArrowLeft, User, MapPin, Calendar, CreditCard, ShieldCheck, Download, AlertCircle, FileText, CheckCircle, XCircle, Search } from 'lucide-react';

const AdminApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState({ isOpen: false, type: null }); // 'approve' | 'reject'
    const [rejectReason, setRejectReason] = useState('');
    const [visaFile, setVisaFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/applications/${id}`);
                setApplication(data);
            } catch (error) {
                console.error('Failed to fetch details:', error);
                alert('Failed to load application details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleBack = () => navigate('/admin/dashboard/applications');

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await dispatch(updateApplicationStatus({
                id: application._id,
                status: actionModal.type === 'approve' ? 'Approved' : 'Rejected',
                rejectionReason: actionModal.type === 'reject' ? rejectReason : null,
                visaDocument: actionModal.type === 'approve' ? visaFile : null
            })).unwrap();

            // Reload details to show updated status
            const { data } = await api.get(`/applications/${id}`);
            setApplication(data);
            setActionModal({ isOpen: false, type: null });
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update application status: ' + error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!application) return <div className="p-8 text-center text-red-500">Application not found</div>;

    const statusColors = {
        Pending: 'text-orange-600 bg-orange-50 border-orange-200',
        Submitted: 'text-blue-600 bg-blue-50 border-blue-200',
        Approved: 'text-green-600 bg-green-50 border-green-200',
        Rejected: 'text-red-600 bg-red-50 border-red-200',
        Processing: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusColors[application.status]}`}>
                        {application.status}
                    </span>
                    {application.status !== 'Approved' && application.status !== 'Rejected' && (
                        <>
                            <button
                                onClick={() => setActionModal({ isOpen: true, type: 'reject' })}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => setActionModal({ isOpen: true, type: 'approve' })}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                Approve & Upload Visa
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Application Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Application #{application.applicationId}</h1>
                                <p className="text-gray-500 mt-1">Submitted on {new Date(application.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Amount</div>
                                <div className="text-2xl font-bold text-gray-900">₹{application.totalAmount?.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-1 text-gray-400" size={18} />
                                <div>
                                    <div className="text-sm text-gray-500">Destination</div>
                                    <div className="font-semibold text-gray-900 text-lg">{application.country?.name}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-1 text-gray-400" size={18} />
                                <div>
                                    <div className="text-sm text-gray-500">Visa Type</div>
                                    <div className="font-semibold text-gray-900">{application.visaType}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Applicants List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Applicants ({application.applicants.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {application.applicants.map((applicant, index) => (
                                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {applicant.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{applicant.firstName} {applicant.lastName}</h4>
                                                <p className="text-sm text-gray-500 font-mono">Passport: {applicant.passportNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="block text-gray-500 text-xs">Nationality</span>
                                            <span className="font-medium">{applicant.nationality}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Date of Birth</span>
                                            <span className="font-medium">{new Date(applicant.dateOfBirth).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Gender</span>
                                            <span className="font-medium">{applicant.gender}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Status</span>
                                            <span className="font-medium text-blue-600">{applicant.status}</span>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="flex gap-3 mt-4">
                                        {Object.entries(applicant.documents || {}).map(([key, url]) => {
                                            if (key === 'other') return null; // Skip array for now or map it differently
                                            return (
                                                <a
                                                    key={key}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                >
                                                    <FileText size={14} className="mr-1.5" />
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Agent & Meta */}
                <div className="space-y-6">
                    {/* Agent Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <User size={18} className="mr-2 text-gray-400" />
                            Agent Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">Agency Name</div>
                                <div className="font-medium text-gray-900">{application.agent?.agencyName || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Contact Person</div>
                                <div className="font-medium text-gray-900">{application.agent?.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Email</div>
                                <a href={`mailto:${application.agent?.email}`} className="font-medium text-blue-600 hover:underline">{application.agent?.email}</a>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Phone</div>
                                <div className="font-medium text-gray-900">{application.agent?.phone}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">KYC Status</div>
                                <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${application.agent?.kycStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {application.agent?.kycStatus}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Additional Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar size={18} className="mr-2 text-gray-400" />
                            Timeline & Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            {application.timeline?.approvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Approved</span>
                                    <span className="font-medium">{new Date(application.timeline.approvedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {application.rejectionReason && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                                    <span className="text-red-800 text-xs font-bold block mb-1">Rejection Reason:</span>
                                    <p className="text-red-700 text-sm leading-relaxed">{application.rejectionReason}</p>
                                </div>
                            )}
                            {application.approvedVisaDocument?.url && (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100 mt-2">
                                    <span className="text-green-800 text-xs font-bold block mb-1">Approved Visa:</span>
                                    <a
                                        href={application.approvedVisaDocument.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-green-700 text-sm underline flex items-center gap-1"
                                    >
                                        <Download size={14} /> Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">
                                {actionModal.type === 'approve' ? 'Approve Application' : 'Reject Application'}
                            </h3>
                            <button onClick={() => setActionModal({ isOpen: false, type: null })} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
                            {actionModal.type === 'reject' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                                    <textarea
                                        required
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px]"
                                        placeholder="Please explain why the application is being rejected..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">This reason will be sent to the agent via email.</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Visa Document</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            required
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setVisaFile(e.target.files[0])}
                                        />
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <Download className="text-gray-400 mb-2" size={32} />
                                            {visaFile ? (
                                                <span className="text-sm font-medium text-green-600">{visaFile.name}</span>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-medium text-gray-700">Click to upload Visa</span>
                                                    <span className="text-xs text-gray-500 mt-1">PDF or Image (Max 5MB)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: false, type: null })}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-sm flex items-center justify-center gap-2
                                        ${actionModal.type === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
                                >
                                    {processing ? 'Processing...' : (actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationDetails;
