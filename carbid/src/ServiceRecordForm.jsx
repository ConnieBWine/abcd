// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ethers } from 'ethers';
// import axios from 'axios';
// import Sidebar from './Sidebar';
// import './ServiceRecordForm.css';
// import user from '../assets/images/user_avatar.jpg';
// import {
//     FiUpload,
//     FiCheck,
//     FiAlertTriangle,
//     FiX
// } from 'react-icons/fi';

// class ErrorBoundary extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { hasError: false, error: null };
//     }

//     static getDerivedStateFromError(error) {
//         return { hasError: true, error };
//     }

//     render() {
//         if (this.state.hasError) {
//             return (
//                 <div className="error-boundary">
//                     <h2>Something went wrong</h2>
//                     <p>{this.state.error?.message || 'Unknown error occurred'}</p>
//                 </div>
//             );
//         }
//         return this.props.children;
//     }
// }

// const ServiceRecordForm = () => {
//     const navigate = useNavigate();
//     const [theme, setTheme] = useState('light');
//     const [formData, setFormData] = useState({
//         vin: '',
//         serviceType: '',
//         description: '',
//         mileage: '',
//         documents: []
//     });
    
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState(false);
//     const [isAuthorized, setIsAuthorized] = useState(false);
//     const [walletAddress, setWalletAddress] = useState(null);

//     const toggleTheme = useCallback(() => {
//         setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
//     }, []);

//     useEffect(() => {
//         checkAuthorization();
//     }, []);
//     useEffect(() => {
//             if (!walletAddress) {
//                 setError('Please connect your wallet to continue');
//             } else {
//                 setError('');
//             }
//     }, [walletAddress]);
    
//     const checkAuthorization = async () => {
//         try {
//             if (!window.ethereum) {
//                 throw new Error('Please install MetaMask');
//             }

//             const provider = new ethers.providers.Web3Provider(window.ethereum);
//             const accounts = await provider.send("eth_requestAccounts", []);
//             const address = accounts[0];
//             setWalletAddress(address);

//             const response = await axios.get(`/api/service-center/check/${address}`);
//             setIsAuthorized(response.data.is_authorized);

//         } catch (error) {
//             console.error('Authorization check failed:', error);
//             setError(typeof error.message === 'string' ? error.message : 'Authorization check failed');
//             setIsAuthorized(false);
//         }
//     };

//     // Helper function to extract error message
//     const getErrorMessage = (error) => {
//         if (typeof error === 'string') return error;
//         if (error.response?.data?.detail) return error.response.data.detail;
//         if (error.message) return error.message;
//         return 'An unexpected error occurred';
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             if (!walletAddress) {
//                 throw new Error('Please connect your wallet first');
//             }

//             // Create form data
//             const formDataToSend = new FormData();
//             formDataToSend.append('serviceType', formData.serviceType);
//             formDataToSend.append('description', formData.description);
//             formDataToSend.append('mileage', formData.mileage);
//             formDataToSend.append('wallet_address', walletAddress);

//             console.log('Sending form data:', {
//                 vin: formData.vin,
//                 serviceType: formData.serviceType,
//                 description: formData.description,
//                 mileage: formData.mileage,
//                 wallet_address: walletAddress
//             });

//             // Send request
//             const response = await axios.post(
//                 `/api/vehicles/${formData.vin}/service-records`,
//                 formDataToSend,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 }
//             );

//             console.log('Response:', response.data);

//             if (response.data.success) {
//                 setSuccess(true);
//                 alert('Service record added successfully!');
//                 navigate(`/vehicle/${formData.vin}/history`);
//             } else {
//                 throw new Error(response.data.message || 'Failed to add service record');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             setError(
//                 error.response?.data?.detail ||
//                 error.response?.data?.message ||
//                 error.message ||
//                 'Failed to add service record'
//             );
//         } finally {
//             setLoading(false);
//         }
//     };
//     // Update the error display in the form
//     const renderError = (error) => {
//         if (!error) return null;
//         let errorMessage = '';
        
//         // Handle different error types
//         if (typeof error === 'object') {
//             if (error.msg) {
//                 errorMessage = error.msg;
//             } else if (error.message) {
//                 errorMessage = error.message;
//             } else if (error.detail) {
//                 errorMessage = error.detail;
//             } else {
//                 errorMessage = 'An unexpected error occurred';
//             }
//         } else {
//             errorMessage = error;
//         }

//     return (
//         <div className="error-message">
//             <FiAlertTriangle className="error-icon" />
//             <span>{errorMessage}</span>
//         </div>
//     );
// };

//     // Return loading state component
//     if (loading) {
//         return (
//             <div className="service-record-page">
//                 <Sidebar
//                     toggleTheme={toggleTheme}
//                     theme={theme}
//                     user={{ name: "Service Center", avatar: user }}
//                 />
//                 <div className="loading">Initializing...</div>
//             </div>
//         );
//     }

//     // Return unauthorized state component
//     if (!isAuthorized) {
//         return (
//             <div className="service-record-page">
//                 <Sidebar
//                     toggleTheme={toggleTheme}
//                     theme={theme}
//                     user={{ name: "Service Center", avatar: user }}
//                 />
//                 <div className="service-record-content">
//                     <div className="unauthorized-message">
//                         <h2>Not Authorized</h2>
//                         <p>You are not authorized as a service center. Please complete the registration process first.</p>
//                         <button
//                             onClick={() => navigate('/ServiceCenterRegistrations')}
//                             className="register-button"
//                         >
//                             Register as Service Center
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="service-record-page">
//             <Sidebar
//                 toggleTheme={toggleTheme}
//                 theme={theme}
//                 user={{ name: "Service Center", avatar: user }}
//             />
//             <div className="service-record-content">
//                 <div className="service-record-container">
//                     <div className="service-record-box">
//                         <h2 className="service-record-title">Add Service Record</h2>

//                         <form onSubmit={handleSubmit} className="service-record-form">
//                             <div className="form-group">
//                                 <label>Vehicle VIN</label>
//                                 <input
//                                     type="text"
//                                     name="vin"
//                                     value={formData.vin}
//                                     onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
//                                     required
//                                     placeholder="Enter VIN"
//                                     className="form-input"
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Service Type</label>
//                                 <select
//                                     name="serviceType"
//                                     value={formData.serviceType}
//                                     onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
//                                     required
//                                 >
//                                     <option value="">Select Service Type</option>
//                                     <option value="oil_change">Oil Change</option>
//                                     <option value="brake_service">Brake Service</option>
//                                     <option value="tire_service">Tire Service</option>
//                                     <option value="maintenance">Regular Maintenance</option>
//                                     <option value="repair">Repair</option>
//                                     <option value="accident">Accident Repair</option>
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Description</label>
//                                 <textarea
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={(e) => setFormData({...formData, description: e.target.value})}
//                                     required
//                                     placeholder="Detailed description of service performed..."
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Current Mileage</label>
//                                 <input
//                                     type="number"
//                                     name="mileage"
//                                     value={formData.mileage}
//                                     onChange={(e) => setFormData({...formData, mileage: e.target.value})}
//                                     required
//                                     min="0"
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Supporting Documents</label>
//                                 <div className="upload-section">
//                                     <input
//                                         type="file"
//                                         multiple
//                                         onChange={(e) => setFormData({...formData, documents: Array.from(e.target.files)})}
//                                         className="hidden"
//                                         id="document-upload"
//                                     />
//                                     <label htmlFor="document-upload" className="upload-label">
//                                         <FiUpload className="upload-icon" />
//                                         <span>Click to upload documents</span>
//                                     </label>
//                                     {formData.documents.length > 0 && (
//                                         <div className="selected-files">
//                                             {formData.documents.length} files selected
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {error && (
//                                 <div className="error-message">
//                                     {renderError(error)}
//                                 </div>
//                             )}

//                             {success && (
//                                 <div className="success-message">
//                                     <FiCheck /> Record added successfully!
//                                 </div>
//                             )}

//                             <button
//                                 type="submit"
//                                 className="submit-button"
//                                 disabled={loading}
//                             >
//                                 {loading ? 'Processing...' : 'Add Service Record'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import Sidebar from './Sidebar';
import { FiUpload, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import './ServiceRecordForm.css';

const ServiceRecordForm = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [formData, setFormData] = useState({
        vin: '',
        serviceType: '',
        description: '',
        mileage: '',
        documents: []
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        checkAuthorization();
    }, []);

    const checkAuthorization = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setWalletAddress(address);

            const response = await axios.get(`/api/service-center/check/${address}`);
            setIsAuthorized(response.data.is_authorized);
        } catch (error) {
            console.error('Authorization check failed:', error);
            setError(error.message || 'Authorization check failed');
            setIsAuthorized(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!walletAddress) {
                throw new Error('Please connect your wallet first');
            }
                const requestData = {
                    service_type: formData.serviceType,
                    description: formData.description,
                    mileage: formData.mileage,
                    wallet_address: walletAddress
                };

                console.log('Sending request:', requestData);  // Add this for debugging

                const response = await axios.post(
                    `/api/vehicles/${formData.vin}/service-records`,
                    requestData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            console.log('Response:', response.data);

            if (response.data.success) {
                setSuccess(true);
                alert('Service record added successfully!');
                navigate(`/vehicle/${formData.vin}/history`);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(
                error.response?.data?.detail || 
                error.message || 
                'Failed to add service record'
            );
        } finally {
            setLoading(false);
        }
    };
    const renderContent = () => {
        if (loading) {
            return <div className="loading">Processing...</div>;
        }

        if (!isAuthorized) {
            return (
                <div className="unauthorized-message">
                    <h2>Not Authorized</h2>
                    <p>You are not authorized as a service center. Please complete the registration process first.</p>
                    <button 
                        onClick={() => navigate('/ServiceCenterRegistrations')} 
                        className="register-button"
                    >
                        Register as Service Center
                    </button>
                </div>
            );
        }

        return (
            <div className="service-record-box">
                <h2 className="service-record-title">Add Service Record</h2>
                
                <form onSubmit={handleSubmit} className="service-record-form">
                    <div className="form-group">
                        <label>Vehicle VIN</label>
                        <input
                            type="text"
                            value={formData.vin}
                            onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                            required
                            placeholder="Enter VIN"
                        />
                    </div>

                    <div className="form-group">
                        <label>Service Type</label>
                        <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                            required
                        >
                            <option value="">Select Service Type</option>
                            <option value="oil_change">Oil Change</option>
                            <option value="brake_service">Brake Service</option>
                            <option value="tire_service">Tire Service</option>
                            <option value="maintenance">Regular Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="accident">Accident Repair</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                            placeholder="Detailed description of service performed..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Current Mileage</label>
                        <input
                            type="number"
                            value={formData.mileage}
                            onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                            required
                            min="0"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <FiAlertTriangle /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <FiCheck /> Record added successfully!
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`submit-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Add Service Record'}
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="service-record-page">
            <Sidebar 
                toggleTheme={toggleTheme}
                theme={theme}
                user={{ name: "Service Center" }}
            />
            <div className="service-record-content">
                <div className="service-record-container">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ServiceRecordForm;