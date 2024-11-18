// Settings.jsx
import React, { useState } from 'react';
import { FiSearch, FiBell, FiMenu, FiCalendar, FiList, FiDollarSign, FiTruck, FiBarChart2, FiRepeat, FiSettings, FiHelpCircle, FiUser, FiCreditCard, FiGlobe, FiLock } from 'react-icons/fi';
import './Settings.css';
import Sidebar from './Sidebar';
import user from '../assets/images/user_avatar.jpg';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const [userInfo, setUserInfo] = useState({
    firstName: 'Smith',
    lastName: 'Hussain',
    email: 'thesmithhussain23@gmail.com',
    currency: 'Dollar',
    address: 'Greenman Kingston 1478',
    state: 'Canada ottawa'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="settings">
      <Sidebar toggleTheme={toggleTheme} theme={theme} user={{ name: "Smith", avatar: user }} />
      <div className="settings__main">
        <main className="settings__content">
          <div className="settings__container">
            <div className="settings__header">
              <h1 className="settings__title">Settings</h1>
              <button className="settings__export-btn">Export</button>
            </div>
            <p className="settings__subtitle">Get your latest update for the last 7 days</p>
            <div className="settings__body">
              <SettingsMenu />
              <GeneralSettings userInfo={userInfo} handleInputChange={handleInputChange} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


const SettingsMenu = () => (
  <div className="settings-menu">
    <SettingsMenuItem icon={<FiSettings />} text="General" subtext="Access the general settings" active />
    <SettingsMenuItem icon={<FiUser />} text="Account" subtext="Edit your personal information" />
    <SettingsMenuItem icon={<FiBell />} text="Notification" subtext="Control your notification history" />
    <SettingsMenuItem icon={<FiCreditCard />} text="Bill Payment" subtext="Access the payment list" />
    <SettingsMenuItem icon={<FiDollarSign />} text="Payment Access" subtext="Watch your payment cards" />
    <SettingsMenuItem icon={<FiGlobe />} text="Language" subtext="Your app language access" />
    <SettingsMenuItem icon={<FiLock />} text="Change Password" subtext="Access to your account password" />
  </div>
);

const SettingsMenuItem = ({ icon, text, subtext, active }) => (
  <div className={`settings-menu__item ${active ? 'settings-menu__item--active' : ''}`}>
    <div className={`settings-menu__icon ${active ? 'settings-menu__icon--active' : ''}`}>
      {icon}
    </div>
    <div className="settings-menu__text">
      <h3 className={`settings-menu__item-title ${active ? 'settings-menu__item-title--active' : ''}`}>{text}</h3>
      <p className="settings-menu__item-subtitle">{subtext}</p>
    </div>
  </div>
);

const GeneralSettings = ({ userInfo, handleInputChange }) => (
  <div className="general-settings">
    <h2 className="general-settings__title">General Settings</h2>
    <form className="general-settings__form">
      <div className="general-settings__form-row">
        <InputField label="First Name" name="firstName" value={userInfo.firstName} onChange={handleInputChange} />
        <InputField label="Last Name" name="lastName" value={userInfo.lastName} onChange={handleInputChange} />
      </div>
      <InputField label="Your Email" name="email" value={userInfo.email} onChange={handleInputChange} />
      <div className="general-settings__form-row">
        <InputField label="Currency Used" name="currency" value={userInfo.currency} onChange={handleInputChange} />
        <InputField label="Address" name="address" value={userInfo.address} onChange={handleInputChange} />
      </div>
      <InputField label="State" name="state" value={userInfo.state} onChange={handleInputChange} />
    </form>
  </div>
);

const InputField = ({ label, name, value, onChange }) => (
  <div className="input-field">
    <label htmlFor={name} className="input-field__label">{label}</label>
    <input
      type="text"
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="input-field__input"
    />
  </div>
);

export default Settings;