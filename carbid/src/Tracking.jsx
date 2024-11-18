import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FiSearch, FiSliders, FiBookmark } from 'react-icons/fi';
import './Tracking.css';

const Tracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const mapCenter = { lat: 0, lng: 0 };
  const mapZoom = 12;

  const vehicles = [
    {
      id: 1,
      brand: 'Lamborghini',
      style: 'Lambo',
      type: 'Petrol',
      color: 'Blue',
      price: 358174,
      image: '/api/placeholder/250/150',
      position: { lat: -0.05, lng: -0.05 },
    },
    {
      id: 2,
      brand: 'Lamborghini',
      style: 'Lambo',
      type: 'Auto',
      color: 'Green',
      price: 285892,
      image: '/api/placeholder/250/150',
      position: { lat: 0.05, lng: 0.05 },
    },
    {
      id: 3,
      brand: 'Lamborghini',
      style: 'Lambo',
      type: 'Auto',
      color: 'Green',
      price: 128795,
      image: '/api/placeholder/250/150',
      position: { lat: -0.05, lng: 0.05 },
    },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  const handleFilter = () => {
    console.log('Filter functionality to be implemented');
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="tracking-container">
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>Tracking</h1>
            <p>Get your latest update for the last 7 days</p>
          </div>
          <div className="header-right">
            <button className="export-button" onClick={handleExport}>
              Export
            </button>
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Best Lamborghini car's"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <button className="filter-button" onClick={handleFilter}>
              <FiSliders /> Filter by
            </button>
          </div>
        </header>
        <div className="map-container">
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={mapZoom}
            >
              {vehicles.map((vehicle) => (
                <Marker
                  key={vehicle.id}
                  position={vehicle.position}
                  onClick={() => handleVehicleSelect(vehicle)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
          <div className="vehicle-cards">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-card ${
                  selectedVehicle?.id === vehicle.id ? 'selected' : ''
                }`}
              >
                <img src={vehicle.image} alt={vehicle.brand} />
                <div className="vehicle-info">
                  <h3>{vehicle.brand}</h3>
                  <div className="vehicle-details">
                    <span>Style: {vehicle.style}</span>
                    <span>Type: {vehicle.type}</span>
                    <span>Color: {vehicle.color}</span>
                  </div>
                  <div className="vehicle-price">${vehicle.price.toLocaleString()}</div>
                </div>
                <div className="bookmark-icon">
                  <FiBookmark />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;