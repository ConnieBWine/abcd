import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { FiFilter, FiSearch } from 'react-icons/fi';

const VehicleMarketplace = () => {
    const { account } = useWeb3React();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        make: '',
        minPrice: '',
        maxPrice: '',
        year: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch('/api/vehicles');
            const data = await response.json();
            setVehicles(data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        if (filters.make && !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())) {
            return false;
        }
        if (filters.minPrice && vehicle.price < parseFloat(filters.minPrice)) {
            return false;
        }
        if (filters.maxPrice && vehicle.price > parseFloat(filters.maxPrice)) {
            return false;
        }
        if (filters.year && vehicle.year !== parseInt(filters.year)) {
            return false;
        }
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <FiFilter className="text-gray-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Make</label>
                        <input
                            type="text"
                            name="make"
                            value={filters.make}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                            placeholder="Search by make"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Min Price (ETH)</label>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                            placeholder="Min price"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Max Price (ETH)</label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                            placeholder="Max price"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                            type="number"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                            placeholder="Filter by year"
                        />
                    </div>
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading vehicles...</p>
                ) : (
                    filteredVehicles.map(vehicle => (
                        <Link
                            key={vehicle.token_id}
                            to={`/vehicle/${vehicle.token_id}`}
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {vehicle.images && vehicle.images[0] && (
                                <img
                                    src={`/api/images/${vehicle.images[0].image_path}`}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-2">
                                    {vehicle.make} {vehicle.model} {vehicle.year}
                                </h3>
                                <p className="text-gray-600 mb-2">VIN: {vehicle.vin}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-blue-600">
                                        {vehicle.price} ETH
                                    </span>
                                    {vehicle.is_for_sale && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                            For Sale
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default VehicleMarketplace;