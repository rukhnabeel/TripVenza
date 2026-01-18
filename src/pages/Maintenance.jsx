import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full flex flex-col items-center">
                <div className="bg-amber-100 p-4 rounded-full mb-6">
                    <AlertTriangle className="w-12 h-12 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Under Maintenance</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    We are currently performing scheduled maintenance to improve our services.
                    Please check back soon.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    );
};

export default Maintenance;
