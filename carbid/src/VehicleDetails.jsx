import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiStar, FiMessageSquare, FiCalendar, FiBookmark } from 'react-icons/fi';
import { useCars, predefinedImages } from './CarContext';
import axios from 'axios';
import Sidebar from './Sidebar';
import './VehicleDetails.css';
import user from '../assets/images/user_avatar.jpg';

const ImageGallery = ({ images, mainImage, isPredefined }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const imageList = images?.length ? images : (mainImage ? [{ image: mainImage }] : []);

    const getImageUrl = (img) => {
        try {
            // Handle predefined images first
            if (isPredefined) {
                const filename = typeof img === 'string' ? img : 
                               img.image || img.url || '';
                               
                if (filename.includes('/')) {
                    const parts = filename.split('/');
                    const actualFilename = parts[parts.length - 1];
                    if (predefinedImages[actualFilename]) {
                        return predefinedImages[actualFilename];
                    }
                } else if (predefinedImages[filename]) {
                    return predefinedImages[filename];
                }
                return `/assets/images/${filename}`;
            }
            
            // Handle uploaded images
            if (typeof img === 'string') {
                return `/uploads/${img}`;
            }
            
            if (img.url) {
                // If it's already a full URL, return as is
                if (img.url.startsWith('http')) {
                    return img.url;
                }
                // Otherwise, prepend the uploads path
                return `/uploads/${img.url}`;
            }
            
            if (img.image) {
                return `/uploads/${img.image}`;
            }
            
            return '/public/images/placeholder.jpg';
        } catch (error) {
            console.error('Error getting image URL:', error, img);
            return '/public/images/placeholder.jpg';
        }
    };

    if (!imageList.length) {
        return null;
    }

    return (
        <div className="image-gallery">
            <div className="main-image">
                <img 
                    src={getImageUrl(imageList[selectedImage])}
                    alt="Vehicle" 
                    className="main-image-content"
                    onError={(e) => {
                        console.error('Image load error:', e.target.src);
                        if (e.target.src !== '/public/images/placeholder.jpg') {
                            e.target.src = '/public/images/placeholder.jpg';
                        }
                    }}
                />
            </div>
            {imageList.length > 1 && (
                <div className="thumbnails">
                    {imageList.map((img, index) => (
                        <div 
                            key={index} 
                            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                            onClick={() => setSelectedImage(index)}
                        >
                            <img 
                                src={getImageUrl(img)}
                                alt={`Thumbnail ${index + 1}`}
                                onError={(e) => {
                                    if (e.target.src !== '/public/images/placeholder.jpg') {
                                        e.target.src = '/public/images/placeholder.jpg';
                                    }
                                }} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// MessageModal Component
const MessageModal = ({ isOpen, onClose, recipientName }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post('/api/messages', { message, recipientName });
            onClose();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Message to {recipientName}</h3>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        required
                    />
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={sending}>
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main VehicleDetails Component
const VehicleDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(location.state?.carData || null);
    const [loading, setLoading] = useState(!location.state?.carData);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchVehicleDetails = async () => {
            if (!vehicle) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/vehicles/details/${id}`);
                    if (response.data.success) {
                        setVehicle(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching vehicle details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchVehicleDetails();
    }, [id, vehicle]);

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Add API call here to save bookmark status
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h2>Error Loading Vehicle Details</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Return to Homepage</button>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="not-found-container">
                <div className="not-found-message">
                    <h2>Vehicle Not Found</h2>
                    <p>The vehicle you're looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/')}>Return to Homepage</button>
                </div>
            </div>
        );
    }

    return (
        <div className="vehicle-details-page">
            <Sidebar 
                toggleTheme={() => {}} 
                theme="light" 
                user={{ name: "Smith", avatar: user }}
            />
            <div className="vehicle-details-content">
                <nav className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span> &gt; 
                    <span>{vehicle.name}</span>
                </nav>

                <header className="vehicle-header">
                    <div className="title-section">
                        <h1>{vehicle.name}</h1>
                        <button 
                            className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
                            onClick={toggleBookmark}
                        >
                            <FiBookmark /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </button>
                    </div>
                    <div className="price-section">
                        ${Number(vehicle.price).toLocaleString()}
                    </div>
                </header>

                <div className="vehicle-content">
                    <ImageGallery 
                        images={vehicle.images} 
                        mainImage={vehicle.image}
                        isPredefined={vehicle.isPredefined}
                    />
                    
                    <div className="vehicle-info">
                        <section className="specifications">
                            <h2>Specifications</h2>
                            <div className="specs-grid">
                                <div className="spec-item">
                                    <span className="label">Make:</span>
                                    <span className="value">{vehicle.style}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="label">Type:</span>
                                    <span className="value">{vehicle.type}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="label">Color:</span>
                                    <span className="value">{vehicle.color}</span>
                                </div>
                            </div>
                        </section>

                        <section className="description">
                            <h2>Description</h2>
                            <p>{vehicle.description}</p>
                        </section>

                        <section className="seller-info">
                            <h2>Seller Information</h2>
                            <div className="seller-card">
                                <img 
                                    src={vehicle.seller?.avatar} 
                                    alt={vehicle.seller?.name} 
                                    className="seller-avatar"
                                />
                                <div className="seller-details">
                                    <h3>{vehicle.seller?.name}</h3>
                                    <div className="seller-rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar 
                                                key={star}
                                                className={star <= vehicle.seller?.rating ? 'filled' : ''}
                                            />
                                        ))}
                                        <span>({vehicle.seller?.totalRatings} ratings)</span>
                                    </div>
                                    <p className="seller-joined">
                                        <FiCalendar /> Member since {vehicle.seller?.joinDate}
                                    </p>
                                </div>
                                <button 
                                    className="contact-seller-btn"
                                    onClick={() => setIsMessageModalOpen(true)}
                                >
                                    <FiMessageSquare /> Contact Seller
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                <MessageModal 
                    isOpen={isMessageModalOpen}
                    onClose={() => setIsMessageModalOpen(false)}
                    recipientName={vehicle.seller?.name}
                />
            </div>
        </div>
    );
};

export default VehicleDetails;