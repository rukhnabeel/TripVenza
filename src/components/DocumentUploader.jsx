import React, { useState, useEffect } from 'react';
import { Upload, Check, Loader, X, Eye } from 'lucide-react';
import api from '../utils/api';
import ImageCropper from './ImageCropper';
import DocumentPreviewModal from './DocumentPreviewModal';
import imageCompression from 'browser-image-compression';

const DocumentUploader = ({ title, onUploadComplete, endpoint = '/ocr/upload', accept = 'image/*', aspect, sampleSrc, initialPreview, documentType, validateFace = false }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    // Cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    // Cleanup blob URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Handle initial preview (e.g. from OCR auto-fill)
    useEffect(() => {
        if (initialPreview && !preview && !uploadedUrl) {
            setPreview(initialPreview);
            setUploadedUrl(initialPreview); // Assume it's already a valid path/base64
        }
    }, [initialPreview]);

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setShowCropper(true);
        };
        reader.readAsDataURL(selected);
        e.target.value = null;
    };

    const handleCropComplete = async (croppedFile) => {
        let fileToProcess = croppedFile;

        // Client-side Image Compression
        try {
            const options = {
                maxSizeMB: 1,          // Limit to 1MB
                maxWidthOrHeight: 1920, // Limit resolution
                useWebWorker: true,
                initialQuality: 0.8
            };
            fileToProcess = await imageCompression(croppedFile, options);
            console.log(`📉 Compression: ${(croppedFile.size / 1024).toFixed(0)}KB -> ${(fileToProcess.size / 1024).toFixed(0)}KB`);
        } catch (error) {
            console.error('⚠️ Image compression failed, using original:', error);
        }

        // Generate preview immediately
        const previewUrl = URL.createObjectURL(fileToProcess);
        setPreview(previewUrl);

        setShowCropper(false);
        setFile(fileToProcess);

        // Upload immediately
        await uploadDocument(fileToProcess);
    };

    const uploadDocument = async (fileToUpload) => {
        setUploading(true);
        try {
            const formData = new FormData();
            // Ensure we pass a filename with extension for backend validation
            const filename = fileToUpload.name || 'upload.jpg';
            formData.append('file', fileToUpload, filename);

            const uploadEndpoint = validateFace ? '/ocr/validate-face' : endpoint;

            const { data } = await api.post(uploadEndpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                // Ensure the path is usable (e.g. prepending base URL if needed, but relative usually works if proxy/static set up)
                // Assuming data.filePath is 'uploads/...'
                // If using vite dev server, might need full URL? 
                // Usually <img src="uploads/..." /> works if public folder or express static is correct.
                setUploadedUrl(data.filePath);
                if (onUploadComplete) onUploadComplete(data.filePath);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message || 'Upload failed');
            setPreview(null); // Revert preview on failure
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation(); // Prevent opening image if clicking remove
        setFile(null);
        setUploadedUrl(null);
        setPreview(null);
        if (onUploadComplete) onUploadComplete(null);
    };

    return (
        <>
            {showCropper && imageSrc && (
                <ImageCropper
                    imageSrc={imageSrc}
                    onCancel={() => setShowCropper(false)}
                    onCropComplete={handleCropComplete}
                    aspect={aspect}
                    sampleSrc={sampleSrc}
                    documentType={documentType}
                />
            )}

            <div className="relative h-40 w-full group">
                {preview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                        {/* Image Preview */}
                        <img
                            src={preview}
                            alt={title}
                            className="w-full h-full object-contain"
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex gap-4">
                                {uploadedUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setPreviewModalOpen(true)}
                                        className="text-white hover:text-blue-200 transition-colors p-2 bg-white/20 rounded-full"
                                        title="View Full Size"
                                    >
                                        <Eye size={20} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="text-white hover:text-red-200 transition-colors p-2 bg-white/20 rounded-full"
                                    title="Remove"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className={`absolute bottom-0 left-0 right-0 py-1 text-[10px] text-center font-bold tracking-wider text-white ${uploadedUrl ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {uploadedUrl ? 'UPLOAD COMPLETE' : 'UPLOADING...'}
                        </div>
                    </div>
                ) : (
                    <label className={`
                        border-2 border-dashed border-gray-300 rounded-lg p-4 
                        flex flex-col items-center justify-center text-center
                        cursor-pointer transition-colors w-full h-full relative overflow-hidden
                        hover:border-blue-500 hover:bg-blue-50
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />

                        {uploading ? (
                            <div className="flex flex-col items-center p-4">
                                <Loader size={24} className="animate-spin text-blue-500 mb-2" />
                                <span className="text-sm font-medium text-gray-600">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload size={24} className="text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">{title}</span>
                                <span className="text-xs text-gray-400 mt-1">Click to browse</span>
                            </div>
                        )}
                    </label>
                )}
            </div>

            <DocumentPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                fileUrl={uploadedUrl || preview}
                title={`${title} - Preview`}
            />
        </>
    );
};

export default DocumentUploader;
