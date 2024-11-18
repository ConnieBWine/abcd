import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { 
    FiSearch, 
    FiFilter, 
    FiMapPin, 
    FiBookmark, 
    FiClock,
    FiAlertTriangle
} from 'react-icons/fi';
import axios from 'axios';
import './Bid.css';
import Sidebar from './Sidebar';
import user from '../assets/images/user_avatar.jpg';

// BidModal Component for placing bids
const BidModal = ({ isOpen, onClose, vehicle, onBidSubmit }) => {
    const [bidAmount, setBidAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to place bids');
            }

            const amount = parseFloat(bidAmount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid bid amount');
            }

            if (amount <= vehicle.currentPrice) {
                throw new Error('Bid must be higher than current price');
            }

            await onBidSubmit(amount);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Place Bid for {vehicle.title || vehicle.name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="bid-info">
                        <p>Current Price: ${vehicle.currentPrice?.toLocaleString()}</p>
                        <p>Minimum Bid: ${(vehicle.currentPrice * 1.05).toLocaleString()}</p>
                    </div>
                    <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Enter bid amount"
                        className="bid-input"
                        required
                    />
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Place Bid'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// AuctionCard Component
const AuctionCard = ({ vehicle, onBidClick }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigate = useNavigate();

    // In Bid.jsx - Update getAuctionImage function in AuctionCard component
    const getAuctionImage = () => {
        try {
            // For uploaded vehicles with images array
            if (vehicle.images && vehicle.images.length > 0) {
                const firstImage = vehicle.images[0];
                
                // If the image has a url property
                if (typeof firstImage === 'object' && firstImage.url) {
                    return firstImage.url;
                }
                
                // If it's just a path string
                return `${axios.defaults.baseURL}/uploads/vehicles/${vehicle.id}/${firstImage}`;
            }
            
            // For single image property
            if (vehicle.image) {
                // Handle predefined images
                if (vehicle.isPredefined) {
                    try {
                        return predefinedImages[vehicle.image] || vehicle.image;
                    } catch {
                        return vehicle.image;
                    }
                }
                
                // Handle uploaded images
                return `${axios.defaults.baseURL}/uploads/vehicles/${vehicle.id}/${vehicle.image}`;
            }
            
            return '/placeholder.jpg';
        } catch (error) {
            console.error('Error loading auction image:', error);
            return '/placeholder.jpg';
        }
    };

    const handleCardClick = () => {
        navigate(`/vehicle/${vehicle.id}`, { 
            state: { 
                carData: vehicle
            } 
        });
    };

    const getTimeRemaining = () => {
        if (!vehicle.auction_end_time) return 'Auction Ended';
        const end = new Date(vehicle.auction_end_time);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) return 'Auction Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h remaining`;
    };

    return (
        <div className="auction-card" onClick={handleCardClick}>
            <div className="image-container">
                <img 
                    src={getAuctionImage()}
                    alt={vehicle.title || vehicle.name}
                    className="auction-image"
                    onError={(e) => {
                        console.error('Image load error for:', vehicle.title || vehicle.name);
                        e.target.src = '/placeholder.jpg';
                    }}
                />
                <button 
                    className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsBookmarked(!isBookmarked);
                    }}
                >
                    <FiBookmark />
                </button>
            </div>

            <div className="auction-info">
                <div className="auction-header">
                    <h3>{vehicle.title || vehicle.name}</h3>
                    <div className="auction-location">
                        <FiMapPin /> {vehicle.location}
                    </div>
                </div>

                <div className="auction-details">
                    <span>Style: {vehicle.style}</span>
                    {vehicle.transmission && <span>Transmission: {vehicle.transmission}</span>}
                    {vehicle.fuel_type && <span>Fuel: {vehicle.fuel_type}</span>}
                    {vehicle.mileage && <span>Mileage: {vehicle.mileage.toLocaleString()} km</span>}
                </div>

                <div className="auction-pricing">
                    <div className="current-price">
                        Current Bid: ${(vehicle.current_bid || vehicle.starting_bid)?.toLocaleString()}
                    </div>
                    <div className="starting-price">
                        Starting: ${vehicle.starting_bid?.toLocaleString()}
                    </div>
                </div>

                <div className="auction-footer">
                    <div className="time-remaining">
                        <FiClock /> {getTimeRemaining()}
                    </div>
                    <button 
                        className="bid-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBidClick(vehicle);
                        }}
                    >
                        Place Bid
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main ActiveBids Component
const ActiveBids = () => {
    const [theme, setTheme] = useState('light');
    const [auctionVehicles, setAuctionVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);
    const [wallet, setWallet] = useState(null);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const navigate = useNavigate();

    // Connect wallet
    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const accounts = await provider.send('eth_requestAccounts', []);
                    setWallet(accounts[0]);
                } catch (error) {
                    console.error('Error connecting wallet:', error);
                }
            }
        };
        connectWallet();
    }, []);

    // Fetch auction vehicles
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await axios.get('/api/vehicles?sale_type=auction');
                setAuctionVehicles(response.data);
            } catch (error) {
                console.error('Error fetching auctions:', error);
                setError(error.message || 'Failed to fetch auction vehicles');
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    const handleBidClick = (vehicle) => {
        if (!wallet) {
            alert('Please connect your wallet to place bids');
            return;
        }
        setSelectedVehicle(vehicle);
        setShowBidModal(true);
    };

    const handleBidSubmit = async (amount) => {
        try {
            // Here you would typically interact with your smart contract
            console.log(`Placing bid of ${amount} on vehicle ${selectedVehicle.id}`);
            // Add your blockchain interaction code here

            // Update UI optimistically
            const updatedVehicles = auctionVehicles.map(v => 
                v.id === selectedVehicle.id 
                    ? {...v, current_bid: amount}
                    : v
            );
            setAuctionVehicles(updatedVehicles);
            
        } catch (error) {
            console.error('Error placing bid:', error);
            throw error;
        }
    };

    // Filter vehicles based on search term
    const filteredVehicles = auctionVehicles.filter(vehicle => 
        (vehicle.title || vehicle.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="active-bids">
                <Sidebar 
                    toggleTheme={toggleTheme} 
                    theme={theme} 
                    user={{ name: "Smith", avatar: user }} 
                />
                <div className="main-content">
                    <div className="loading-spinner">Loading auctions...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="active-bids">
                <Sidebar 
                    toggleTheme={toggleTheme} 
                    theme={theme} 
                    user={{ name: "Smith", avatar: user }} 
                />
                <div className="main-content">
                    <div className="error-container">
                        <FiAlertTriangle className="error-icon" />
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`active-bids ${theme}`}>
            <Sidebar 
                toggleTheme={toggleTheme} 
                theme={theme} 
                user={{ name: "Smith", avatar: user }} 
            />
            <div className="main-content">
                <div className="content-area">
                    <div className="bids-header">
                        <div>
                            <h1>Active Bids</h1>
                            <p>Explore and bid on available auctions</p>
                        </div>
                        <div className="header-actions">
                            <div className="search-container">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button className="filter-button">
                                <FiFilter /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="auction-grid">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map((vehicle) => (
                                <AuctionCard 
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onBidClick={handleBidClick}
                                />
                            ))
                        ) : (
                            <div className="no-auctions">
                                <p>No active auctions found</p>
                                <button onClick={() => navigate('/listing')}>
                                    Create an Auction
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showBidModal && selectedVehicle && (
                    <BidModal
                        isOpen={showBidModal}
                        onClose={() => setShowBidModal(false)}
                        vehicle={selectedVehicle}
                        onBidSubmit={handleBidSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default ActiveBids;