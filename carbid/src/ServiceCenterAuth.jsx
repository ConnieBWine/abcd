// ServiceCenterAuth.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const ServiceCenterAuth = () => {
    const [account, setAccount] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeWeb3();
    }, []);

    const initializeWeb3 = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask');
            }

            // Connect to provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Request account access
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);

            // Check authorization status
            const response = await axios.get(
                `/api/service-center/check/${address}`
            );
            setIsAuthorized(response.data.is_authorized);

        } catch (err) {
            setError('Failed to connect: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async (formData) => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('wallet_address', account);

            const response = await axios.post(
                '/api/service-center/register',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                // Redirect or show success message
                window.location.href = '/service-center/dashboard';
            }

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="auth-container">
            <div className="wallet-info">
                <h3>Connected Wallet</h3>
                <p>{account}</p>
                <p>Authorization Status: {isAuthorized ? 'Authorized' : 'Not Authorized'}</p>
            </div>

            {!isAuthorized && (
                <div className="registration-prompt">
                    <p>Your service center is not authorized.</p>
                    <button 
                        onClick={() => window.location.href = '/service-center/register'}
                        className="register-button"
                    >
                        Register as Service Center
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServiceCenterAuth;