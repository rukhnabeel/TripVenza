import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Download, ChevronRight, XCircle, Calendar, MapPin, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ApplicationStatusCard = ({ application }) => {
    const navigate = useNavigate();
    const {
        status,
        applicants,
        country,
        visaType,
        travelDate,
        returnDate,
        timeline,
        updatedAt,
        applicationId
    } = application;

    const mainApplicant = applicants[0];
    const applicantName = application.isGroupApplication
        ? application.groupName
        : `${mainApplicant?.firstName} ${mainApplicant?.lastName}`;

    // Status Configuration with Premium Colors
    const statusConfig = {
        Approved: {
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-700',
            borderColor: 'border-emerald-200',
            icon: CheckCircle,
            label: 'Visa Approved',
        },
        Pending: {
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200',
            icon: Clock,
            label: 'Pending Review',
        },
        Submitted: {
            color: 'bg-sky-500',
            lightColor: 'bg-sky-50',
            textColor: 'text-sky-700',
            borderColor: 'border-sky-200',
            icon: Clock,
            label: 'Submitted',
        },
        Processing: {
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            borderColor: 'border-indigo-200',
            icon: Clock,
            label: 'Processing',
        },
        Rejected: {
            color: 'bg-rose-500',
            lightColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            borderColor: 'border-rose-200',
            icon: XCircle,
            label: 'Visa Rejected',
        },
        Draft: {
            color: 'bg-gray-400',
            lightColor: 'bg-gray-100',
            textColor: 'text-gray-600',
            borderColor: 'border-gray-200',
            icon: FileText,
            label: 'Draft Saved',
        }
    };

    const currentStatus = statusConfig[status] || statusConfig.Pending;
    const StatusIcon = currentStatus.icon;

    // Timeline Steps logic
    const steps = [
        { label: 'Submitted', date: timeline?.submittedAt || application.createdAt, done: true },
        { label: 'Payment', date: timeline?.submittedAt || application.createdAt, done: application.paymentStatus === 'Paid' },
        { label: 'Immigration', date: timeline?.processingAt, done: ['Processing', 'Approved', 'Rejected'].includes(status) },
        { label: 'Decision', date: timeline?.approvedAt || timeline?.rejectedAt, done: ['Approved', 'Rejected'].includes(status) }
    ];

    // Estimated Date Logic
    const getEstimatedDate = () => {
        if (status === 'Approved' || status === 'Rejected') return 'Completed';
        if (status === 'Draft') return 'Not Submitted';
        if (timeline?.processingAt) {
            const date = new Date(timeline.processingAt);
            date.setDate(date.getDate() + 5); // Add 5 days
            return date.toLocaleDateString();
        }
        return 'Calculated after submission';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            {/* Header Strip */}
            <div className={`h-1.5 w-full ${currentStatus.color}`}></div>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${currentStatus.lightColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
                                        {currentStatus.label}
                                    </span>
                                    <span className="text-gray-400 text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{applicationId?.slice(-8).toUpperCase()}</span>
                                </div>
                                <Link to={`/dashboard/applications/${application.applicationId}`} className="group-hover:text-blue-600 transition-colors">
                                    <h3 className="text-xl font-bold text-gray-900 font-display">{applicantName}</h3>
                                </Link>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{country?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={16} className="text-gray-400" />
                                        <span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">{mainApplicant?.passportNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Timeline (Compact) */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between relative z-0">
                                {/* Line background */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center bg-white px-2">
                                        <div className={`w-3.5 h-3.5 rounded-full border-[3px] transition-colors duration-500 ${step.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'} mb-1`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visa Type & Dates Chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100 uppercase tracking-wide">
                                {visaType || 'Tourist Visa'}
                            </span>
                            {travelDate && (
                                <span className="px-3 py-1 bg-blue-50/50 rounded-lg text-xs font-medium text-blue-700 border border-blue-100 flex items-center gap-1">
                                    <Calendar size={12} /> Travel: {new Date(travelDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions & status box */}
                    <div className="lg:w-72 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                        {/* Status Box */}
                        <div className={`${currentStatus.lightColor} p-4 rounded-xl border ${currentStatus.borderColor}`}>
                            <div className="flex items-start gap-3">
                                <StatusIcon size={20} className={`${currentStatus.textColor} mt-0.5 shrink-0`} />
                                <div>
                                    <p className={`font-bold text-sm ${currentStatus.textColor}`}>{currentStatus.label}</p>
                                    <p className="text-xs text-gray-600 mt-1 leading-snug">
                                        {status === 'Rejected'
                                            ? <span className="text-red-600 font-medium">{application.rejectionReason || 'Reason not specified'}</span>
                                            : status === 'Approved' ? 'Your e-Visa document is ready for download.'
                                                : status === 'Draft' ? 'Application incomplete.'
                                                    : `Estimated Completion: ${getEstimatedDate()}`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5 mt-auto">
                            {status === 'Draft' ? (
                                <button
                                    onClick={() => navigate('/dashboard/new-visa/apply', {
                                        state: {
                                            country: country,
                                            visa: { type: visaType, totalFee: application.pricingSnapshot?.totalAmount || 0 },
                                            // Passing applicants data back to allow resuming
                                            applicants: applicants
                                        }
                                    })}
                                    className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200"
                                >
                                    Resume Application
                                </button>
                            ) : (
                                <>
                                    {status === 'Approved' && application.approvedVisaDocument?.url ? (
                                        <a
                                            href={(application.approvedVisaDocument.url.startsWith('http') || application.approvedVisaDocument.url.startsWith('blob:'))
                                                ? application.approvedVisaDocument.url
                                                : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${application.approvedVisaDocument.url.startsWith('/') ? '' : '/'}${application.approvedVisaDocument.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
                                        >
                                            <Download size={16} className="mr-1.5" /> Download Visa
                                        </a>
                                    ) : (
                                        <button disabled className="flex-1 bg-gray-50 text-gray-400 text-xs font-bold py-2.5 rounded-xl border border-gray-100 flex items-center justify-center cursor-not-allowed opacity-60">
                                            <Download size={16} className="mr-1.5" /> Unavailable
                                        </button>
                                    )}

                                    <Link
                                        to={`/dashboard/applications/${application.applicationId}`}
                                        className="px-4 py-2.5 bg-white border-2 border-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all text-center flex items-center justify-center"
                                    >
                                        Details
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationStatusCard;
