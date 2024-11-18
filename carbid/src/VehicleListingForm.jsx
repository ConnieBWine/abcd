import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { FiUpload, FiX } from 'react-icons/fi';
import './VehicleListingForm.css';

const VehicleListingForm = ({ sellerId, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    saleType: 'fixed', // 'fixed' or 'auction'
    auctionDuration: 7, // days
    startingBid: '',
    mileage: '',
    fuel_type: 'petrol',
    transmission: 'automatic',
    color: '',
    location: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(null);

  // Connect wallet on component mount
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.send('eth_requestAccounts', []);
          setWallet(accounts[0]);
        } catch (error) {
          setError('Failed to connect wallet. Please try again.');
        }
      }
    };
    connectWallet();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({ ...prev, images: files }));
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);

    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

// VehicleListingForm.jsx - update handleSubmit
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
        setError('Please connect your wallet first');
        return;
    }

    setLoading(true);
    setError('');

    try {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.keys(formData).forEach(key => {
            if (key !== 'images') {
                formDataToSend.append(key, formData[key].toString());
            }
        });
        
        // Handle images
        formData.images.forEach(image => {
            formDataToSend.append('images', image);
        });

        const response = await axios.post('/api/vehicles', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            const newVehicleId = response.data.vehicle_id;
            
            // Refresh the page list immediately
            if (formData.saleType === 'auction') {
                // Redirect to auctions page
                navigate('/active-bids', { 
                    state: { refresh: true } 
                });
            } else {
                // Redirect to dashboard
                navigate('/', { 
                    state: { refresh: true } 
                });
            }

            onSuccess?.(newVehicleId);
        }
    } catch (error) {
        console.error('Error creating listing:', error);
        setError(error.response?.data?.detail || 'Error creating listing');
    } finally {
        setLoading(false);
    }
};
  return (
    <form onSubmit={handleSubmit} className="vehicle-listing-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., 2023 Toyota Supra Premium"
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
            placeholder="e.g., Toyota"
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
            placeholder="e.g., Supra"
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
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>

        <div className="form-group">
          <label>Sale Type</label>
          <select
            name="saleType"
            value={formData.saleType}
            onChange={handleInputChange}
          >
            <option value="fixed">Fixed Price</option>
            <option value="auction">Auction</option>
          </select>
        </div>

        {formData.saleType === 'fixed' ? (
          <div className="form-group">
            <label>Price (ETH)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              step="0.001"
              min="0"
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Starting Bid (ETH)</label>
              <input
                type="number"
                name="startingBid"
                value={formData.startingBid}
                onChange={handleInputChange}
                required
                step="0.001"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Auction Duration (Days)</label>
              <input
                type="number"
                name="auctionDuration"
                value={formData.auctionDuration}
                onChange={handleInputChange}
                required
                min="1"
                max="30"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Mileage (km)</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Fuel Type</label>
          <select
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleInputChange}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label>Transmission</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
            <option value="semi-automatic">Semi-Automatic</option>
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
          placeholder="e.g., Tokyo, Japan"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows="4"
          placeholder="Describe your vehicle's features, condition, and history"
        />
      </div>

      <div className="form-group">
        <label>Vehicle Images (Max 5)</label>
        <div className="upload-container">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-label">
            <FiUpload className="upload-icon" />
            <span>Click to upload images</span>
          </label>
          
          <div className="image-previews">
            {previewImages.map((preview, index) => (
              <div key={index} className="preview-image">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage(index)}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="submit-button"
        disabled={loading || !wallet}
      >
        {loading ? 'Creating Listing...' : 'Create Listing'}
      </button>

      {!wallet && (
        <p className="wallet-warning">
          Please connect your wallet to create a listing
        </p>
      )}
    </form>
  );
};

export default VehicleListingForm;