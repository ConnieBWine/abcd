import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FiUpload, FiCheck } from 'react-icons/fi';
import './VehicleRegister.css';
import user from '../assets/images/user_avatar.jpg';

const VehicleRegister = () => {
    const [theme, setTheme] = useState('light');
    const [formData, setFormData] = useState({
        vin: '',
        make: '',
        model: '',
        year: '',
        price: '',
        description: '',
        style: '',
        type: 'Petrol',
        color: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

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
            // Blockchain integration will go here
            setSuccess(true);
        } catch (error) {
            console.error('Error registering vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Sidebar toggleTheme={toggleTheme} theme={theme} user={{ name: "Smith", avatar: user }} />
            <main className="register-content">
                <section className="register-section">
                    <div className="section-header">
                        <div>
                            <h1>Register New Vehicle</h1>
                            <p>List your vehicle on the blockchain</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>VIN</label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Make</label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Price (ETH)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="0.001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Style</label>
                                <input
                                    type="text"
                                    name="style"
                                    value={formData.style}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Vehicle Images</label>
                            <div className="upload-container">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="upload-label">
                                    <FiUpload className="upload-icon" />
                                    <span>Click to upload images</span>
                                </label>
                                {images.length > 0 && (
                                    <p className="upload-info">
                                        {images.length} images selected
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register Vehicle'}
                        </button>

                        {success && (
                            <div className="success-message">
                                <FiCheck />
                                Vehicle registered successfully on the blockchain!
                            </div>
                        )}
                    </form>
                </section>
            </main>
        </div>
    );
};

export default VehicleRegister;