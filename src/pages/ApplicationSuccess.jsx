import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, FileText, Home, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ApplicationSuccess = () => {
    const location = useLocation();
    const { applicationId, countryName, totalAmount } = location.state || {};

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
                <p className="text-gray-500 mb-8">
                    Your visa application for <span className="font-semibold text-gray-800">{countryName || 'the requested country'}</span> has been successfully received.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Application ID</span>
                        <span className="font-mono font-medium text-gray-900">{applicationId || 'PENDING'}</span>
                    </div>
                    {totalAmount && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-medium text-green-600">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Submitted</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            // Mock Download for now
                            const element = document.createElement("a");
                            const file = new Blob([`Receipt for Application ${applicationId}\nAmount: ${totalAmount}\nDate: ${new Date().toISOString()}`], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = `receipt-${applicationId}.txt`;
                            document.body.appendChild(element); // Required for this to work in FireFox
                            element.click();
                            document.body.removeChild(element);
                        }}
                        className="block w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                        <Download size={18} />
                        Download Receipt
                    </button>

                    <Link
                        to="/dashboard/applications"
                        className="block w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Track Application Status
                    </Link>

                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Home size={18} className="mr-2" />
                            Dashboard
                        </Link>
                        <Link
                            to="/dashboard/new-visa"
                            className="flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            <FileText size={18} className="mr-2" />
                            New Visa
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ApplicationSuccess;
