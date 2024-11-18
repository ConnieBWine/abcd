import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiCalendar, FiDollarSign, FiTruck, FiBarChart2, FiRepeat, FiSearch, FiSettings, FiHelpCircle, FiBell } from 'react-icons/fi';
import './Sidebar.css';
import user from '../assets/images/user_avatar.jpg';

// Add this to your Sidebar.jsx or wherever you have the logout button
const handleLogout = async () => {
  try {
    // Call logout endpoint
    const response = await fetch('/api/logout.php', {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      // Clear session storage
      sessionStorage.removeItem('user_id');
      // Redirect to login
      navigate('/login');
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const Sidebar = ({ toggleTheme, theme, user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  return (
    <div className="sidebar-container">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span>CarEmpire</span>
        </div>
        <div className="menu-label">Menu</div>
        <ul>
          <li>
            <NavLink to="/" end>
              <FiMenu /> Dashboard
            </NavLink>
          </li>
          <li><NavLink to="/listing"><FiCalendar /> Listing</NavLink></li>
          <li><NavLink to="/ServiceCenterRegistrations"><FiDollarSign /> Authorization</NavLink></li>
          <li>
            <NavLink to="/active-bids">
              <FiBarChart2 /> Active Bids
            </NavLink>
          </li>
            <li><NavLink to="/vehicle/:vin/history"><FiCalendar /> Vehicle History</NavLink></li>
            <li><NavLink to="/add-service-record">Add Service Record</NavLink></li>
            {/* <li><NavLink to="/my-vehicles"><FiTruck /> My Vehicles</NavLink></li> */}
          <li><NavLink to="/statistics"><FiBarChart2 /> Statistics</NavLink></li>
        </ul>
        <div className="menu-label">Other Menu</div>
        <ul className="bottom-menu">
          <li><NavLink to="/settings"><FiSettings /> Settings</NavLink></li>
        </ul>
      </nav>
      <header className="header">
        <div className="search-bar">
          <FiSearch />
          <input type="text" placeholder="Type here to search" />
        </div>
        <div className="header-right">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button className="notifications">
            <FiBell />
          </button>
          <div className="user-info">
            <img src={user.avatar} alt="User" className="user-avatar" />
            <span className="user-name">Hello {user.name}</span>
          </div>
          <span className="date">{currentDate}</span>
        </div>
      </header>
    </div>
  );
};

export default Sidebar;