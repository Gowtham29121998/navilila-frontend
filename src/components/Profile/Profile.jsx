import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { setUser } from '../../redux/userSlice';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'other',
    image: '',
  });

  const [loading, setLoading] = useState(false);

  // Password Change States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setForm({
          username: data.username || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || 'other',
          image: data.image === 'https://via.placeholder.com/150' ? '' : (data.image || ''),
        });
      } catch (err) {
        toast.error('Failed to load profile');
      }
    };
    if (userInfo) fetchProfile();
  }, [userInfo]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        image: form.image,
      });
      dispatch(setUser({ ...userInfo, ...data }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      toast.error('Password needs 1 Caps, 1 Number, and 1 Special Character');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPassLoading(true);
    try {
      await api.put('/users/profile', {
        password: passwords.newPassword,
        currentPassword: passwords.currentPassword
      });
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account details and security</p>
        </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <label style={{ display: 'block', height: '100%', cursor: 'pointer' }}>
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({ ...form, image: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              {form.image ? (
                <img src={form.image} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-fallback">
                  {form.username?.charAt(0).toUpperCase() || userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="profile-upload-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload</span>
              </div>
            </label>
          </div>
          <div className="profile-info-display">
            <h3>{form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : form.username}</h3>
            <p>@{form.username}</p>
            <p className="profile-email-badge">{form.email}</p>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-form-card">
            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-section">
                <h3>Personal Information</h3>
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label>Username</label>
                    <input name="username" value={form.username} onChange={handleFormChange} placeholder="johndoe123" />
                  </div>
                  <div className="profile-form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div className="profile-form-group">
                    <label>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="John" />
                  </div>
                  <div className="profile-form-group">
                    <label>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Doe" />
                  </div>
                  <div className="profile-form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="9876543210" />
                  </div>
                  <div className="profile-form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h3>Account Security</h3>
                <div className="security-card-premium">
                  <div className="security-visual">
                    <div className="lock-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                  </div>
                  <div className="security-details">
                    <div className="security-text">
                      <strong>Login Password</strong>
                      <p>Update your password to keep your account secure</p>
                    </div>
                    <button type="button" className="password-change-trigger" onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button type="submit" className="profile-save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="phone-modal-overlay">
          <div className="phone-modal premium-modal">
            <div className="modal-header-simple">
              <h3>Change Password</h3>
              <p>Strengthen your account security</p>
            </div>
            <form onSubmit={handlePasswordChangeSubmit}>
              <div className="profile-form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showCurrentPass ? "text" : "password"} 
                    value={passwords.currentPassword} 
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
                    required
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                  >
                    {showCurrentPass ? (
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
              </div>
              <div className="profile-form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showNewPass ? "text" : "password"} 
                    value={passwords.newPassword} 
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                    required
                    placeholder="Min. 6 chars, 1 caps, 1 symbol"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? (
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
              </div>
              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPass ? "text" : "password"} 
                    value={passwords.confirmPassword} 
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                    required
                    placeholder="Repeat new password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? (
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
              </div>
              <div className="phone-modal-actions">
                <button type="button" className="phone-cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="phone-verify-btn premium-submit" disabled={passLoading}>
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
