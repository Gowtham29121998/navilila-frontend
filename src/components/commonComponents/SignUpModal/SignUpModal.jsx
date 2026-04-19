import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { setUser } from '../../../redux/userSlice';
import logoIcon from '../../../assets/logoIcon.png';
import logoName from '../../../assets/logoName.png';
import './SignUpModal.css';

const SignUpModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('signin'); // 'signup', 'signin', 'forgot'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    if (mode === 'signup') {
      if (!username.trim()) newErrors.username = "Username is required";
      else if (username.length < 3) newErrors.username = "Min 3 characters";
    }

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (mode === 'signup') {
      if (!phone.trim()) newErrors.phone = "Phone is required";
      else if (!/^\d{10}$/.test(phone.trim())) newErrors.phone = "Invalid 10-digit number";
    }

    if (mode !== 'forgot') {
      if (!password) newErrors.password = "Password is required";
      else if (password.length < 6) newErrors.password = "Min 6 characters";
      else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
          newErrors.password = "Need 1 Caps, 1 Number, 1 Special Char";
        }
      }

      if (mode === 'signup' || mode === 'reset') {
        if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
        else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let response;
      if (mode === 'signup') {
        response = await api.post('/users/signup', { username, email, phone, password });
        toast.success("Account created successfully!");
      } else if (mode === 'signin') {
        response = await api.post('/users/signin', { email, password });
        toast.success("Welcome back!");
      } else {
        // Forgot password
        await api.post('/users/forgotpassword', { email });
        toast.success("Password reset link sent to your email!");
        setMode('signin');
        setLoading(false);
        return;
      }

      const userData = {
        token: response.data.token,
        ...response.data.user
      };

      localStorage.setItem('userInfo', JSON.stringify(userData));
      dispatch(setUser(userData));
      onClose();
      resetForm();
    } catch (error) {
      console.error("Auth Error", error);
      toast.error(error.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode('signin');
    setUsername('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-brand-row">
              <img src={logoIcon} alt="Logo Icon" className="modal-logo-icon" />
              <img src={logoName} alt="Elevate" className="modal-logo-name" />
            </div>
            <h2>
              {mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Welcome Back' : 'Reset Password'}
            </h2>
            <p>
              {mode === 'signup' ? 'Join us for premium experiences' : mode === 'signin' ? 'Sign in to your account' : 'Enter your email to receive a reset link'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className={errors.username ? 'error-input' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className={errors.email ? 'error-input' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={errors.phone ? 'error-input' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={errors.password ? 'error-input' : ''}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
            )}

            {mode === 'signup' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'error-input' : ''}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}

            {mode === 'signin' && (
              <div className="forgot-link-row">
                <span onClick={() => setMode('forgot')} className="forgot-link">Forgot Password?</span>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : mode === 'signin' ? 'Sign In' : 'Send Link'}
            </button>

            <div className="toggle-mode-text">
              {mode === 'forgot' ? (
                <span onClick={() => setMode('signin')} className="toggle-link">Back to Login</span>
              ) : (
                <>
                  {mode === 'signup' ? "Already have an account? " : "Don't have an account? "}
                  <span onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="toggle-link">
                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </span>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
