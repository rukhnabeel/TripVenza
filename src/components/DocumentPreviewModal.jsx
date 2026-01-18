import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

const DocumentPreviewModal = ({ isOpen, onClose, fileUrl, fileType = 'image', title = 'Document Preview' }) => {
    if (!isOpen || !fileUrl) return null;

    // Normalize URL: Ensure it points to backend if it's a relative path and not a blob
    const fullUrl = fileUrl.startsWith('blob:') || fileUrl.startsWith('http')
        ? fileUrl
        : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${fileUrl.replace(/\\/g, '/')}`;

    const isPdf = fileType === 'pdf' || fullUrl.toLowerCase().endsWith('.pdf');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 truncate pr-4">{title}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={20} />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
                    {isPdf ? (
                        <object
                            data={fullUrl}
                            type="application/pdf"
                            className="w-full h-full min-h-[60vh] rounded-lg border border-gray-200 bg-white"
                        >
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>Unable to display PDF directly.</p>
                                <a
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline mt-2"
                                >
                                    Download to view
                                </a>
                            </div>
                        </object>
                    ) : (
                        <img
                            src={fullUrl}
                            alt="Preview"
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
