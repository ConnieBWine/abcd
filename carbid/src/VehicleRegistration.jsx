import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { FiUpload, FiCheck } from 'react-icons/fi';

const VehicleRegistration = () => {
    const { account, library } = useWeb3React();
    const [formData, setFormData] = useState({
        vin: '',
        make: '',
        model: '',
        year: '',
        price: '',
        description: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Register vehicle
            const response = await fetch('/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    owner_address: account
                }),
            });

            const data = await response.json();
            const tokenId = data.token_id;

            // Upload images
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('files', image);
                });

                await fetch(`/api/vehicles/${tokenId}/images`, {
                    method: 'POST',
                    body: formData,
                });
            }

            setSuccess(true);
        } catch (error) {
            console.error('Error registering vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Register New Vehicle</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">VIN</label>
                        <input
                            type="text"
                            name="vin"
                            value={formData.vin}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Make</label>
                        <input
                            type="text"
                            name="make"
                            value={formData.make}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Price (ETH)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        step="0.001"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows="4"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Vehicle Images</label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <FiUpload className="mx-auto text-3xl mb-2" />
                            <p>Click to upload images</p>
                        </label>
                        {images.length > 0 && (
                            <p className="mt-2 text-sm text-gray-600">
                                {images.length} images selected
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register Vehicle'}
                </button>
            </form>

            {success && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded flex items-center">
                    <FiCheck className="mr-2" />
                    Vehicle registered successfully!
                </div>
            )}
        </div>
    );
};

export default VehicleRegistration;