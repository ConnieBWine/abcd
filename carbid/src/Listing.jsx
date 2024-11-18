import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import './Listing.css';
import Sidebar from './Sidebar';
import VehicleListingForm from './VehicleListingForm';

const Listing = () => {
  const [theme, setTheme] = useState('light');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);
      
      // Set authorization header for all future requests
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleListingSuccess = (vehicleId) => {
    // Show success message and redirect
    navigate(`/vehicle/${vehicleId}`);
  };

  // Only render if we have user data
  if (!userData) {
    return null; // Or a loading spinner
  }

  return (
    <div className="listing-container">
      <Sidebar 
        toggleTheme={toggleTheme} 
        theme={theme} 
        user={userData} 
      />
      <main className="listing-content">
        <section className="car-section">
          <div className="section-header">
            <div>
              <h1>List Your Vehicle</h1>
              <p>Create a new vehicle listing</p>
            </div>
            <div className="header-actions">
              <button className="draft-btn">Save as Draft</button>
              <button className="preview-btn">Preview</button>
            </div>
          </div>
          
          <div className="listing-form-container">
            <VehicleListingForm 
              sellerId={userData.id}
              onSuccess={handleListingSuccess}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Listing;