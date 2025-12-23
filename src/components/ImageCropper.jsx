import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, Sun, Contrast, Droplet, Wand2, FileText, Palette } from 'lucide-react';

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation);
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    filters = { brightness: 100, contrast: 100, grayscale: false }
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    let filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;
    if (filters.grayscale) filterString += ' grayscale(100%)';
    ctx.filter = filterString;

    ctx.drawImage(image, 0, 0);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = pixelCrop.width;
    cropCanvas.height = pixelCrop.height;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        cropCanvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.9);
    });
}

const ImageCropper = ({ imageSrc, onCancel, onCropComplete, sampleSrc, aspect, documentType = 'passport-front' }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Filters
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [grayscale, setGrayscale] = useState(false);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;

        setProcessing(true);
        try {
            const croppedImageBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                { horizontal: false, vertical: false },
                { brightness, contrast, grayscale }
            );

            // Simple Client-Side Blur Check
            const image = await createImage(URL.createObjectURL(croppedImageBlob));
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let sum = 0, sumSq = 0, pixelCount = data.length / 4;
            for (let i = 0; i < data.length; i += 4) {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                sum += gray;
                sumSq += gray * gray;
            }
            const mean = sum / pixelCount;
            const variance = (sumSq / pixelCount) - (mean * mean);
            const stdDev = Math.sqrt(variance);

            if (stdDev < 20) {
                if (!window.confirm("⚠️ Quality Warning: The image appears very blurry or low contrast. Are you sure you want to proceed?")) {
                    setProcessing(false);
                    return;
                }
            }

            const file = new File([croppedImageBlob], "cropped-passport.jpg", {
                type: "image/jpeg",
                lastModified: Date.now()
            });

            onCropComplete(file);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    }, [imageSrc, croppedAreaPixels, rotation, brightness, contrast, grayscale, onCropComplete]);

    const applyAutoEnhance = () => {
        setBrightness(110);
        setContrast(120);
        setGrayscale(false);
    };

    const applyScanMode = () => {
        setBrightness(115);
        setContrast(150);
        setGrayscale(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Crop & Enhance Your Document</h3>
                        <p className="text-xs text-gray-500 mt-1">Adjust the frame and apply filters for best results</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Cropper Area */}
                    <div className="flex-1 bg-gray-900 relative">
                        {documentType === 'passport-front' && (
                            <style>{`
                                .custom-crop-area::after {
                                    content: 'MRZ Zone - TD3 Standard (2 lines × 44 chars)';
                                    position: absolute;
                                    bottom: 0;
                                    left: 0;
                                    right: 0;
                                    height: 26%;
                                    margin: 0;
                                    padding: 0;
                                    border: 2px solid rgba(0, 255, 0, 0.4);
                                    border-top: 3px solid rgba(0, 255, 0, 0.8);
                                    border-bottom: none;
                                    background: rgba(0, 255, 0, 0.12);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: rgba(0, 255, 0, 1);
                                    font-size: 9px;
                                    font-weight: bold;
                                    pointer-events: none;
                                    opacity: 1;
                                    text-shadow: 0px 1px 3px rgba(0,0,0,0.9);
                                    letter-spacing: 0.5px;
                                }
                            `}</style>
                        )}
                        {documentType === 'photo' && (
                            <style>{`
                                .custom-crop-area::after {
                                    content: 'Face Oval';
                                    position: absolute;
                                    bottom: 10%;
                                    left: 20%;
                                    right: 20%;
                                    top: 10%;
                                    height: 80%;
                                    border-radius: 50%;
                                    border: 2px dashed rgba(255, 255, 255, 0.7);
                                    background: rgba(0, 0, 0, 0.1);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: rgba(255, 255, 255, 0.7);
                                    font-size: 10px;
                                    font-weight: bold;
                                    pointer-events: none;
                                    opacity: 1;
                                    text-shadow: 0px 1px 2px rgba(0,0,0,0.8);
                                }
                            `}</style>
                        )}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale ? 1 : 0})`
                        }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspect}
                                onCropChange={onCropChange}
                                onCropComplete={onCropAreaChange}
                                onZoomChange={setZoom}
                                cropShape={documentType === 'photo' ? 'round' : 'rect'}
                                showGrid={false}
                                classes={{ containerClassName: 'custom-crop-area' }}
                            />
                        </div>
                    </div>

                    {/* Right Sidebar - Controls */}
                    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Actions</h4>
                                <button
                                    onClick={applyAutoEnhance}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <Wand2 size={18} />
                                    Auto-Enhance
                                </button>
                                <button
                                    onClick={applyScanMode}
                                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <FileText size={18} />
                                    Scan Mode (B&W)
                                </button>
                            </div>

                            {/* Zoom Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Droplet size={16} className="text-blue-500" />
                                    Zoom: {zoom.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Rotation Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <RotateCw size={16} className="text-indigo-500" />
                                    Rotation: {rotation}°
                                </label>
                                <input
                                    type="range"
                                    min={-45}
                                    max={45}
                                    step={1}
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <button
                                    onClick={() => setRotation(0)}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Brightness Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Sun size={16} className="text-yellow-500" />
                                    Brightness: {brightness}%
                                </label>
                                <input
                                    type="range"
                                    min={50}
                                    max={200}
                                    step={5}
                                    value={brightness}
                                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>

                            {/* Contrast Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Contrast size={16} className="text-purple-500" />
                                    Contrast: {contrast}%
                                </label>
                                <input
                                    type="range"
                                    min={50}
                                    max={200}
                                    step={5}
                                    value={contrast}
                                    onChange={(e) => setContrast(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Grayscale Toggle */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Palette size={16} className="text-gray-500" />
                                    Grayscale Mode
                                </label>
                                <button
                                    onClick={() => setGrayscale(!grayscale)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${grayscale ? 'bg-gray-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${grayscale ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-gray-200 space-y-3 bg-white">
                            <button
                                onClick={handleConfirm}
                                disabled={processing}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Confirm & Continue
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
