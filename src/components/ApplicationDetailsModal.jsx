import React from 'react';
import { X, CheckCircle, Clock, AlertCircle, FileText, User, Download } from 'lucide-react';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
    if (!isOpen || !application) return null;

    const statusColors = {
        Pending: 'text-orange-600 bg-orange-50 border-orange-200',
        Submitted: 'text-blue-600 bg-blue-50 border-blue-200',
        Approved: 'text-green-600 bg-green-50 border-green-200',
        Rejected: 'text-red-600 bg-red-50 border-red-200',
        Processing: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                        <p className="text-gray-500 text-sm mt-1">ID: <span className="font-mono text-gray-700">{application.applicationId}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status Banner */}
                    <div className={`flex items-center p-4 rounded-xl border ${statusColors[application.status] || 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm uppercase tracking-wide opacity-80">Application Status</h3>
                            <p className="text-lg font-bold mt-1">{application.status || 'Unknown'}</p>
                        </div>
                        <div className="flex-1 text-right">
                            <h3 className="font-semibold text-sm uppercase tracking-wide opacity-80">Submitted On</h3>
                            <p className="font-medium mt-1">{new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Trip Information</h3>
                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Destination Country</p>
                                <p className="font-medium text-gray-900">{application.country?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Visa Type</p>
                                <p className="font-medium text-gray-900">{application.visaType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Applicants */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 px-1">
                            Applicants ({application.applicants?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {application.applicants?.map((applicant, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {applicant.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{applicant.firstName} {applicant.lastName}</p>
                                            <p className="text-sm text-gray-500 font-mono">{applicant.passportNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[applicant.status] || 'bg-gray-100'}`}>
                                            {applicant.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Payment Summary</h3>
                        <div className="border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-bold text-lg">₹{application.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="font-medium text-gray-900">{application.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-gray-500">Payment Status</span>
                                <span className={`font-medium ${application.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                    {application.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => {
                            // Mock Download Receipt
                            alert(`Downloading receipt for ${application.applicationId}`);
                        }}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText size={18} />
                        Receipt
                    </button>

                    {/* Rejection Reason */}
                    {application.status === 'Rejected' && application.rejectionReason && (
                        <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Rejection Reason
                            </h4>
                            <p className="text-red-700">{application.rejectionReason}</p>
                        </div>
                    )}

                    {application.status === 'Approved' && application.approvedVisaDocument?.url && (
                        <a
                            href={application.approvedVisaDocument.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Download E-Visa
                        </a>
                    )}

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-transparent text-gray-500 font-medium rounded-xl hover:text-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;
