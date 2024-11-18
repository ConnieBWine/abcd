import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Configure axios
  const api = axios.create({
      baseURL: 'http://localhost:8000',
      headers: {
          'Content-Type': 'application/json',
      },
      timeout: 10000, // Increased timeout
      withCredentials: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
          // Test database connection first
          const dbTest = await api.get('/api/test-db');
          if (dbTest.data.status === 'error') {
              throw new Error(`Database connection failed: ${dbTest.data.message}`);
          }

          // Proceed with registration
          const response = await api.post('/api/register', {
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              phone: formData.phone.trim(),
              password: formData.password
          });

          if (response.data.success) {
              setError('Registration successful! Redirecting to login...');
              setTimeout(() => {
                  navigate('/login');
              }, 1500);
          }
      } catch (error) {
          console.error('Registration error:', error);
          if (error.code === 'ECONNREFUSED') {
              setError('Server is not running. Please start the server.');
          } else if (error.response) {
              setError(error.response.data.detail || 'Registration failed');
          } else {
              setError(error.message || 'Unknown error occurred');
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us to start your journey</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

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
            <FiPhone className="input-icon" />
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="Phone Number"
              value={formData.phone}
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
              minLength="8"
            />
            <div 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>

          <div className="form-group">
            <FiLock className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength="8"
            />
            <div 
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`signup-button ${loading ? 'signup-button-loading' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="links-container">
            <a href="/login" className="login-link">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;