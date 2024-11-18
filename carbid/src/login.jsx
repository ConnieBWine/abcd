import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';
import axios from 'axios';


const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  // In login.jsx, update the handleSubmit function
  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await api.post('/api/login', {
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          // Store both user data and token
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.access_token);
          
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          
          navigate('/');
        }
      } catch (error) {
        setError(
          error.response?.data?.detail || 
          error.message || 
          'Login failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <div 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? 'login-button-loading' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="links-container">
            <a href="/signup" className="login-link">
              Don't have an account? Register
            </a>
            <a href="/forgot-password" className="login-link">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;