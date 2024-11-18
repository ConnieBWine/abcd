import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { FiTool, FiUpload } from 'react-icons/fi';

const AddServiceRecord = ({ tokenId, onRecordAdded }) => {
    const { account } = useWeb3React();
    const [formData, setFormData] = useState({
        service_type: '',
        description: '',
        mileage: '',
        documents: []
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            documents: files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/vehicles/${tokenId}/service-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    service_center_id: account
                }),
            });

            if (response.ok) {
                onRecordAdded();
                setFormData({
                    service_type: '',
                    description: '',
                    mileage: '',
                    documents: []
                });
            }
        } catch (error) {
            console.error('Error adding service record:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiTool className="mr-2" />
                Add Service Record
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Service Type
                    </label>
                    <input
                        type="text"
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows="3"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Mileage (km)
                    </label>
                    <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Supporting Documents
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="document-upload"
                        />
                        <label htmlFor="document-upload" className="cursor-pointer">
                            <FiUpload className="mx-auto text-3xl mb-2" />
                            <p>Upload documents</p>
                        </label>
                        {formData.documents.length > 0 && (
                            <p className="mt-2 text-sm text-gray-600">
                                {formData.documents.length} files selected
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Adding Record...' : 'Add Service Record'}
                </button>
            </form>
        </div>
    );
};

export default AddServiceRecord;