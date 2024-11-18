import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { FiUpload, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Sidebar from './Sidebar';
import './ServiceCenterRegistration.css';

const ServiceCenterRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        businessAddress: '',
        licenseNumber: '',
        phoneNumber: '',
        email: '',
        documents: []
    });

    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [existingRegistration, setExistingRegistration] = useState(null);

    useEffect(() => {
        initializeWallet();
    }, []);

    const checkWalletStatus = async (address) => {
        try {
            const response = await axios.get(`/api/service-center/check-wallet/${address}`);
            if (response.data.exists) {
                setExistingRegistration(response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking wallet status:', error);
            return false;
        }
    };

    const initializeWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to continue');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const address = accounts[0];
            setWalletAddress(address);

            // Check if wallet is already registered
            const isRegistered = await checkWalletStatus(address);
            if (isRegistered) {
                console.log('Wallet already registered');
            }

        } catch (error) {
            setError(error.message);
        }
    };

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
        setError('');

        try {
            // Validate wallet address
            if (!walletAddress) {
                throw new Error('Please connect your wallet first');
            }

            // Validate required fields
            if (!formData.businessName || !formData.businessAddress || !formData.licenseNumber) {
                throw new Error('Please fill in all required fields');
            }

            const submitData = new FormData();
            // Add form fields
            Object.keys(formData).forEach(key => {
                if (key !== 'documents') {
                    submitData.append(key, formData[key]);
                }
            });

            // Add wallet address
            submitData.append('wallet_address', walletAddress);

            // Add documents if any
            formData.documents.forEach(doc => {
                submitData.append('documents', doc);
            });

            // Log the form data being sent
            console.log('Submitting form data:', Object.fromEntries(submitData));

            const response = await axios.post(
                '/api/service-center/register',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Registration response:', response.data);

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/service-center/dashboard');
                }, 2000);
            }

        } catch (error) {
            console.error('Registration error:', error);
            // Extract the error message from the response if available
            const errorMessage = error.response?.data?.detail || error.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

        if (existingRegistration) {
        return (
            <div className="registration-container">
                <div className="registration-box">
                    <div className="already-registered-message">
                        <h2>Wallet Already Registered</h2>
                        <div className="registration-details">
                            <p><strong>Business Name:</strong> {existingRegistration.businessName}</p>
                            <p><strong>Status:</strong> {existingRegistration.status}</p>
                            <p><strong>Approval Date:</strong> {new Date(existingRegistration.approvalDate).toLocaleDateString()}</p>
                        </div>
                        <p>This wallet address is already registered as a service center.</p>
                        <div className="action-buttons">
                            <button 
                                className="primary-button"
                                onClick={() => navigate('/service-center/dashboard')}
                            >
                                Go to Dashboard
                            </button>
                            <button 
                                className="secondary-button"
                                onClick={() => window.location.reload()}
                            >
                                Use Different Wallet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (success) {
        return (
            <div className="registration-container">
                <div className="approved-message">
                    <FiCheckCircle className="approved-icon" />
                    <h2>Registration Successful!</h2>
                    <p>Your service center is now authorized to add vehicle records.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-container">
            <Sidebar 
                toggleTheme={() => {}} 
                theme="light" 
                user={{ name: "Service Center", avatar: "/user-avatar.jpg" }}
            />
            <div className="registration-box">
                <h2>Service Center Registration</h2>
                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Business Name</label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>License Number</label>
                            <input
                                type="text"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Business Address</label>
                        <textarea
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Connected Wallet Address</label>
                        <input
                            type="text"
                            value={walletAddress}
                            readOnly
                            className="wallet-address"
                        />
                    </div>

                    <div className="form-group">
                        <label>Supporting Documents (Optional)</label>
                        <div className="document-upload">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                id="document-upload"
                            />
                            <label htmlFor="document-upload" className="upload-label">
                                <FiUpload className="upload-icon" />
                                <span>Upload Documents (Optional)</span>
                            </label>
                            {formData.documents.length > 0 && (
                                <div className="uploaded-files">
                                    {formData.documents.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <FiCheckCircle /> {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Service Center'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ServiceCenterRegistration;