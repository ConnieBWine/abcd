// VehicleHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiTool, 
    FiAlertTriangle, 
    FiClock,
    FiMapPin,
    FiFile,
    FiSearch,
    FiX
} from 'react-icons/fi';
import axios from 'axios';
import Sidebar from './Sidebar';
import './VehicleHistory.css';

const VehicleHistory = () => {
    const { vin: urlVin } = useParams();
    const navigate = useNavigate();
    const [searchVin, setSearchVin] = useState(urlVin || '');
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = async (vin) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/vehicles/${vin}/history`);
            setHistory(response.data);
            navigate(`/vehicle/${vin}/history`, { replace: true });
        } catch (error) {
            setError(error.response?.data?.detail || 'Error fetching vehicle history');
            setHistory(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchVin.trim()) {
            setError('Please enter a VIN');
            return;
        }
        fetchHistory(searchVin.trim());
    };

    useEffect(() => {
        if (urlVin) {
            fetchHistory(urlVin);
        }
    }, [urlVin]);

    return (
        <div className="vehicle-history-page">
            <Sidebar 
                toggleTheme={() => {}} 
                theme="light" 
                user={{ name: "User", avatar: "/user-avatar.jpg" }}
            />
            <div className="vehicle-history-content">
                {/* Search Section */}
                <div className="search-section">
                    <h1>Vehicle History Search</h1>
                    <form onSubmit={handleSearch} className="vin-search-form">
                        <div className="search-input-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                value={searchVin}
                                onChange={(e) => setSearchVin(e.target.value.toUpperCase())}
                                placeholder="Enter VIN"
                                className="vin-search-input"
                            />
                            {searchVin && (
                                <FiX 
                                    className="clear-icon"
                                    onClick={() => setSearchVin('')}
                                />
                            )}
                        </div>
                        <button type="submit" className="search-button">
                            Search History
                        </button>
                    </form>
                    {error && (
                        <div className="error-message">
                            <FiAlertTriangle />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <span>Fetching vehicle history...</span>
                    </div>
                ) : history ? (
                    <div className="history-results">
                        <div className="timeline">
                            {history.serviceRecords.length > 0 ? (
                                history.serviceRecords.map((record, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker">
                                            <FiTool />
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{record.serviceType}</h4>
                                            <p>{record.description}</p>
                                            <div className="timeline-info">
                                                <span>
                                                    <FiClock /> {new Date(record.timestamp * 1000).toLocaleDateString()}
                                                </span>
                                                <span>
                                                    <FiMapPin /> {record.serviceCenter}
                                                </span>
                                                <span>
                                                    Mileage: {record.mileage.toLocaleString()} km
                                                </span>
                                            </div>
                                            {record.documentPaths?.map((path, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={`/uploads/${path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="document-link"
                                                >
                                                    <FiFile /> View Document {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-records">
                                    No service records found for this vehicle
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default VehicleHistory;