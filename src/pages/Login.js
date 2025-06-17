import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInUser, signInWithGoogle, resetPassword } from '../services/firebase';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const message = location.state?.message;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { user, error } = await signInUser(formData.email, formData.password);
      
      if (error) {
        if (error.includes('user-not-found')) {
          setErrors({ email: 'No account found with this email address' });
        } else if (error.includes('wrong-password')) {
          setErrors({ password: 'Incorrect password' });
        } else if (error.includes('invalid-email')) {
          setErrors({ email: 'Invalid email address' });
        } else if (error.includes('too-many-requests')) {
          setErrors({ general: 'Too many failed attempts. Please try again later.' });
        } else {
          setErrors({ general: 'Login failed. Please check your credentials.' });
        }
      } else {
        // Redirect to intended page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        setErrors({ general: 'Google sign-in failed. Please try again.' });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      setResetMessage('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        if (error.includes('user-not-found')) {
          setResetMessage('No account found with this email address');
        } else {
          setResetMessage('Failed to send reset email. Please try again.');
        }
      } else {
        setResetMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
          setResetEmail('');
        }, 3000);
      }
    } catch (error) {
      setResetMessage('An unexpected error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your NextWatch account</p>
          </div>

          {message && (
            <div className="info-message">
              <svg className="info-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              {message}
            </div>
          )}

          {errors.general && (
            <div className="error-message">
              <svg className="error-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {errors.general}
            </div>
          )}

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className={`auth-button primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button 
                type="button" 
                className="auth-button google"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="auth-form">
              <div className="form-header">
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={resetLoading}
                />
              </div>

              {resetMessage && (
                <div className={`message ${resetMessage.includes('sent') ? 'success' : 'error'}`}>
                  {resetMessage}
                </div>
              )}

              <div className="form-actions-row">
                <button 
                  type="button" 
                  className="auth-button secondary"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetEmail('');
                  }}
                  disabled={resetLoading}
                >
                  Back to Sign In
                </button>

                <button 
                  type="submit" 
                  className={`auth-button primary ${resetLoading ? 'loading' : ''}`}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
