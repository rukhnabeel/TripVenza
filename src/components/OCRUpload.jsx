import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Camera, Crop as CropIcon } from 'lucide-react';
import api from '../utils/api';
import ImageCropper from './ImageCropper';
import DocumentPreviewModal from './DocumentPreviewModal';

/**
 * OCR Upload Component for Passport Processing
 * Allows users to upload passport images and auto-fill form fields
 */
const OCRUpload = ({ onDataExtracted, applicantIndex = 0, sampleSrc, mode = 'front' }) => {
    const [uploading, setUploading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Modal State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    // Cropping state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, JPG, or PNG)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        // Set image for cropping
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageToCrop(reader.result);
            setCropModalOpen(true);
            // Reset input value to allow selecting same file again if cancelled
            event.target.value = null;
        };
        reader.readAsDataURL(file);
    };

    const handleCropCancelled = () => {
        setCropModalOpen(false);
        setImageToCrop(null);
    };

    const handleCropConfirmed = async (croppedFile) => {
        setCropModalOpen(false);

        // Show preview of cropped image
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(croppedFile);

        // Process the cropped file
        await processPassport(croppedFile);
    };

    const processPassport = async (file) => {
        setUploading(true);
        setError(null);
        setOcrResult(null);

        try {
            const formData = new FormData();
            formData.append('passport', file);
            formData.append('type', mode); // Send 'front' or 'back'

            const { data } = await api.post('/ocr/passport', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                // Modified Check: Front requires MRZ, Back does not
                const isValidFront = mode === 'front' && data.mrzParsed;
                const isValidBack = mode === 'back';

                if (isValidFront || isValidBack) {
                    setOcrResult(data);

                    // Call parent callback with extracted data and metadata
                    if (onDataExtracted) {
                        onDataExtracted(data, applicantIndex);
                    }
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 1000);
                } else {
                    setError('Invalid Document: Could not verify passport details (MRZ missing). Please upload a clear Passport Front.');
                    setPreview(null); // Clear preview to force re-upload
                }
            } else {
                setError(data.message || 'Failed to extract passport data');
                setPreview(null); // Clear preview to force re-upload
            }

        } catch (err) {
            console.error('OCR Error:', err);
            setError(err.response?.data?.message || 'Failed to process passport image');
        } finally {
            setUploading(false);
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 80) return 'bg-green-100 text-green-800';
        if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-4">
            {/* Image Cropper Modal */}
            {cropModalOpen && imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCancel={handleCropCancelled}
                    onCropComplete={handleCropConfirmed}
                    sampleSrc={sampleSrc}
                    aspect={mode === 'back' ? undefined : 1.42} // ID-3 Standard: 125mm × 88mm (1.42 aspect ratio)
                    documentType={mode === 'back' ? 'passport-back' : 'passport-front'}
                />
            )}

            {/* Upload Area */}
            <div className="relative">
                <input
                    type="file"
                    id={`passport-upload-${mode}-${applicantIndex}`}
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                <label
                    htmlFor={`passport-upload-${mode}-${applicantIndex}`}
                    className={`
                        border-2 border-dashed rounded-xl p-6 
                        flex flex-col items-center justify-center
                        cursor-pointer transition-all duration-300
                        ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
                        ${error ? 'border-red-300 bg-red-50' : ''}
                    `}
                >
                    {uploading ? (
                        <>
                            <Loader className="animate-spin text-blue-600 mb-3" size={32} />
                            <p className="text-blue-600 font-medium">Reviewing Quality...</p>
                            <p className="text-sm text-gray-500 mt-1">Checking for Blur, Glare, and Framing...</p>
                        </>
                    ) : preview ? (
                        <>
                            <div className="relative group">
                                <img src={preview} alt="Passport preview" className="max-h-40 rounded-lg mb-3 shadow-sm object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <CropIcon className="text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">Click to upload & crop differently</p>
                        </>
                    ) : (
                        <>
                            <Camera className="text-gray-400 mb-3" size={32} />
                            <p className="text-gray-700 font-medium">Upload Passport Image</p>
                            <p className="text-sm text-gray-500 mt-1">Click to browse or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-2">JPEG, JPG, PNG (Max 10MB)</p>
                        </>
                    )}
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Success Result */}
            {/* Success Result - Transient Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center animate-pulse">
                    <CheckCircle className="text-green-600 mr-2" size={20} />
                    <p className="text-green-800 font-bold text-sm">Passport Data Extracted Successfully</p>
                </div>
            )}

            {/* Info Message */}
            {!ocrResult && !error && !uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                        💡 <strong>Tip:</strong> Crop only the bio-data page for better accuracy.
                    </p>
                </div>
            )}


            {/* Visa Filing Rules (Always Visible at bottom) */}
            <div className="mt-2 text-[10px] text-gray-400 space-y-1 pl-1 border-t border-dashed border-gray-200 pt-2 flex justify-between items-end">
                <div>
                    <p className="font-semibold uppercase text-gray-500">Document Rules:</p>
                    <div className="grid grid-cols-2 gap-x-2">
                        <p>• Avoid Flash/Glare</p>
                        <p>• No Fingers Visible</p>
                        <p>• Sharp Text (No Blur)</p>
                        <p>• Data Page Only</p>
                    </div>
                </div>

                {/* View Full Image Button (Only if preview exists) */}
                {preview && (
                    <button
                        type="button"
                        onClick={() => setPreviewModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                        <FileText size={12} className="mr-1" /> View Full Image
                    </button>
                )}
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                fileUrl={ocrResult?.filePath || preview} // Prefer server path, fallback to local preview
                title={`${mode === 'front' ? 'Passport Front' : 'Passport Back'} - Preview`}
            />
        </div>
    );
};

export default OCRUpload;
