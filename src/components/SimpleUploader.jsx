import React, { useState } from 'react';
import { Upload, FileText, X, Eye } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

/**
 * Simple File Uploader for PDFs and Images without cropping
 * Used for Cover Page, Tickets, Hotel Booking
 */
const SimpleUploader = ({
    title = "Upload File",
    accept = "image/*,application/pdf",
    onUploadComplete,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSizeMB = 10 // Default 10MB
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [error, setError] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            setError(`Please upload a valid file type: ${allowedTypes.join(', ')}`);
            return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setUploading(true);
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/ocr/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setPreview(data.filePath);
                if (onUploadComplete) {
                    onUploadComplete(data.filePath);
                }
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            setError('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName(null);
        setError(null);
    };

    return (
        <div className="space-y-2">
            {!preview ? (
                <div className="relative">
                    <input
                        type="file"
                        id={`simple-upload-${title}`}
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <label
                        htmlFor={`simple-upload-${title}`}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploading
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <p className="text-sm text-blue-600 font-medium">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600 font-medium">Click to browse</p>
                                    <p className="text-xs text-gray-400 mt-1">{title}</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-green-800">{fileName || 'File uploaded'}</p>
                            <p className="text-xs text-green-600">Upload successful</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPreviewModalOpen(true)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="View"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={handleRemove}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {error}
                </div>
            )}

            <DocumentPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                fileUrl={preview}
                fileType={fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'}
                title={`${title} - Preview`}
            />
        </div>
    );
};

export default SimpleUploader;
