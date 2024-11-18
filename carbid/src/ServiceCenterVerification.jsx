import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { FiShield, FiUpload } from 'react-icons/fi';

const ServiceCenterVerification = () => {
    const { account, library } = useWeb3React();
    const [formData, setFormData] = useState({
        businessName: '',
        licenseNumber: '',
        address: '',
        documents: []
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sign verification message
            const message = `Verify service center: ${formData.businessName}`;
            const signature = await library.getSigner().signMessage(message);

            // Create form data with files
            const submitData = new FormData();
            submitData.append('businessName', formData.businessName);
            submitData.append('licenseNumber', formData.licenseNumber);
            submitData.append('address', formData.address);
            submitData.append('signature', signature);
            submitData.append('walletAddress', account);

            formData.documents.forEach(doc => {
                submitData.append('documents', doc);
            });

            // Submit verification request
            const response = await fetch('/api/service-centers/verify', {
                method: 'POST',
                body: submitData
            });

            if (response.ok) {
                // Handle success
            }
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <FiShield className="text-3xl text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold">Service Center Verification</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={formData.businessName}
                            onChange={e => setFormData({...formData, businessName: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            License Number
                        </label>
                        <input
                            type="text"
                            value={formData.licenseNumber}
                            onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Business Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Supporting Documents
                        </label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <input
                                type="file"
                                multiple
                                onChange={e => setFormData({...formData, documents: Array.from(e.target.files)})}
                                className="hidden"
                                id="docs-upload"
                            />
                            <label htmlFor="docs-upload" className="cursor-pointer">
                                <FiUpload className="mx-auto text-3xl mb-2" />
                                <p>Upload verification documents</p>
                                <p className="text-sm text-gray-500">
                                    (Business license, certifications, etc.)
                                </p>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit for Verification'}
                </button>
            </form>
        </div>
    );
};

export default ServiceCenterVerification;