import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { CarProvider } from './CarContext';
import axios from 'axios';

// Import global polyfills
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import ErrorBoundary from './ErrorBoundary'; 

// Page Components
import Dashboard from './Dashboard';
import ActiveBids from './Bid';
import ServiceCenterRegistration from './ServiceCenterRegistration';
import Settings from './Settings';
import Statistics from './Statistics';
import Tracking from './Tracking';
import Listing from './Listing';
import VehicleDetails from './VehicleDetails';
import Login from './login';
import SignUp from './SignUp';
import VehicleHistory from './VehicleHistory';
import ServiceRecordForm from './ServiceRecordForm';
import VehicleMarketplace from './VehicleMarketplace';
import VehicleRegister from './VehicleRegister';

// Styles
import './index.css';

// main.jsx - Fixed axios interceptors
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';

// Single comprehensive response interceptor with fixed image handling
axios.interceptors.response.use(
    response => {
        // Helper function to transform image URLs
        const transformImageUrl = (img, itemId, saleType) => {
            console.log('Transforming image:', { img, itemId, saleType }); // Debug log

            // If image is already a full URL, return as is
            if (typeof img === 'string' && img.startsWith('http')) {
                return { url: img };
            }

            // If image is an object with url property
            if (typeof img === 'object' && img.url) {
                const url = img.url.startsWith('/') ?
                    `${axios.defaults.baseURL}${img.url}` :
                    img.url.startsWith('http') ?
                        img.url :
                        `${axios.defaults.baseURL}/uploads/${img.url}`;
                console.log('Transformed object URL:', url); // Debug log
                return { ...img, url };
            }

            // For auction vehicles (maintaining old path structure)
            if (saleType === 'auction') {
                const url = `${axios.defaults.baseURL}/uploads/vehicles/${itemId}/${img}`;
                console.log('Auction image URL:', url); // Debug log
                return { url };
            }

            // For fixed-price vehicles
            const url = `${axios.defaults.baseURL}/uploads/vehicles/${itemId}/images/${img}`;
            console.log('Fixed-price image URL:', url); // Debug log
            return { url };
        };

        // Transform array responses
        if (response.data && Array.isArray(response.data)) {
            response.data = response.data.map(item => {
                if (item.images) {
                    return {
                        ...item,
                        images: item.images.map(img => 
                            transformImageUrl(img, item.id, item.sale_type)
                        )
                    };
                }
                return item;
            });
        }
        // Transform single object responses
        else if (response.data && response.data.images) {
            response.data = {
                ...response.data,
                images: response.data.images.map(img => 
                    transformImageUrl(img, response.data.id, response.data.sale_type)
                )
            };
        }

        // Debug log
        console.log('Transformed response:', response.data);

        return response;
    },
    error => {
        // Handle unauthorized errors
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Update ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Web3 Configuration
const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider, 'any');
  library.pollingInterval = 12000;
  return library;
};

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem('user');
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// Main App Component
function MainApp() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <CarProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/active-bids" element={
              <ProtectedRoute>
                <ActiveBids />
              </ProtectedRoute>
            } />
            <Route 
              path="/ServiceCenterRegistrations" // Make sure this matches exactly
              element={
                <ProtectedRoute>
                  <ServiceCenterRegistration />
                </ProtectedRoute>
              } 
            />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
            <Route path="/listing" element={
              <ProtectedRoute>
                <Listing />
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            } />
            <Route path="/vehicle/:id" element={
              <ProtectedRoute>
                <VehicleDetails />
              </ProtectedRoute>
            } />

            {/* Vehicle Management Routes */}
            <Route path="/vehicle/:vin/history" element={
              <ProtectedRoute>
                <VehicleHistory />
              </ProtectedRoute>
            } />
            <Route path="/add-service-record" element={
                <ErrorBoundary>
                    <ProtectedRoute>
                        <ServiceRecordForm />
                    </ProtectedRoute>
                </ErrorBoundary>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <VehicleMarketplace />
              </ProtectedRoute>
            } />
            <Route path="/register-vehicle" element={
              <ProtectedRoute>
                <VehicleRegister />
              </ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CarProvider>
    </Web3ReactProvider>
  );
}

// Mount the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);