import React, { useState } from 'react';
import { Camera, FileText, CheckCircle, XCircle, Download, Upload as UploadIcon } from 'lucide-react';
import OCRUpload from '../components/OCRUpload';

/**
 * OCR Demo Page
 * Demonstrates OCR functionality with sample passport processing
 */
const OCRDemo = () => {
    const [extractedData, setExtractedData] = useState(null);
    const [testResults, setTestResults] = useState([]);

    const handleDataExtracted = (data, index) => {
        setExtractedData(data);

        // Add to test results
        setTestResults(prev => [...prev, {
            timestamp: new Date().toLocaleString(),
            data: data,
            success: true
        }]);
    };

    const samplePassportData = {
        passportNumber: 'AB1234567',
        firstName: 'JOHN',
        lastName: 'DOE',
        dateOfBirth: '1990-01-15',
        passportExpiry: '2030-01-15',
        nationality: 'INDIAN',
        gender: 'Male'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <Camera className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        OCR System Demo
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Upload a passport image to automatically extract and fill applicant information
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Camera className="text-blue-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Smart Recognition</h3>
                        <p className="text-gray-600 text-sm">
                            Advanced OCR technology extracts passport data with high accuracy
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Auto-Fill Forms</h3>
                        <p className="text-gray-600 text-sm">
                            Automatically populate application forms with extracted data
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="text-purple-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">MRZ Parsing</h3>
                        <p className="text-gray-600 text-sm">
                            Reads Machine Readable Zone for enhanced accuracy
                        </p>
                    </div>
                </div>

                {/* Main Demo Area */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Upload Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <UploadIcon className="mr-3 text-blue-600" size={28} />
                            Upload Passport
                        </h2>

                        <OCRUpload
                            onDataExtracted={handleDataExtracted}
                            applicantIndex={0}
                        />

                        {/* Instructions */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2">📸 Tips for Best Results:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Use a clear, well-lit photo of the passport bio-data page</li>
                                <li>• Ensure the entire page is visible and in focus</li>
                                <li>• Avoid shadows, glare, or reflections</li>
                                <li>• Keep the passport flat and straight</li>
                                <li>• Supported formats: JPEG, JPG, PNG (Max 10MB)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <FileText className="mr-3 text-green-600" size={28} />
                            Extracted Data
                        </h2>

                        {extractedData ? (
                            <div className="space-y-4">
                                {/* Data Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(extractedData).map(([key, value]) => (
                                        value && (
                                            <div key={key} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-gray-900 font-semibold">
                                                    {value}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Success Message */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-green-800 font-medium">Data Extracted Successfully!</p>
                                        <p className="text-green-600 text-sm mt-1">
                                            All fields have been automatically populated. You can now review and edit if needed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500">
                                    Upload a passport image to see extracted data here
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sample Data Reference */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <FileText className="mr-3" size={28} />
                        Sample Passport Data Format
                    </h2>
                    <p className="mb-6 opacity-90">
                        Here's an example of the data structure that will be extracted from your passport:
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 font-mono text-sm">
                        <pre className="overflow-x-auto">
                            {JSON.stringify(samplePassportData, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Test Results History */}
                {testResults.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Test Results History
                        </h2>

                        <div className="space-y-4">
                            {testResults.map((result, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                                        {result.success ? (
                                            <CheckCircle className="text-green-600" size={20} />
                                        ) : (
                                            <XCircle className="text-red-600" size={20} />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        {Object.entries(result.data).slice(0, 6).map(([key, value]) => (
                                            value && (
                                                <div key={key}>
                                                    <p className="text-gray-500 text-xs">{key}</p>
                                                    <p className="text-gray-900 font-medium truncate">{value}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Information */}
                <div className="mt-12 bg-gray-900 rounded-2xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">API Endpoint</h2>
                    <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                        <p className="text-green-400">POST</p>
                        <p className="text-blue-300">/api/ocr/passport</p>
                        <p className="text-gray-400 mt-2">Content-Type: multipart/form-data</p>
                        <p className="text-gray-400">Authorization: Bearer &lt;token&gt;</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OCRDemo;
