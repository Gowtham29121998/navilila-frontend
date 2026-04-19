import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    gst: 18,
    deliveryFee: 50,
    heroSection: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleHeroChange = (index, field, value) => {
    const updatedHero = [...settings.heroSection];
    updatedHero[index][field] = value;
    setSettings(prev => ({ ...prev, heroSection: updatedHero }));
  };

  const addHeroSlide = () => {
    setSettings(prev => ({
      ...prev,
      heroSection: [
        ...prev.heroSection,
        { image: '', title: '', subtitle: '', link: '' }
      ]
    }));
  };

  const removeHeroSlide = (index) => {
    const updatedHero = settings.heroSection.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, heroSection: updatedHero }));
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(index);
    try {
      const { data } = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleHeroChange(index, 'image', data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading configuration...</div>;

  return (
    <div className="admin-page-wrapper">
      <div className="admin-container">
        <header className="page-header">
          <div className="header-info">
            <h1>Site Configuration</h1>
            <p>Manage GST, Delivery Fees, and Hero Content</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="admin-form-stack">
          <div className="settings-section dashboard-card">
            <h2>Tax & Shipping</h2>
            <div className="form-row">
              <div className="form-group">
                <label>GST Percentage (%)</label>
                <input
                  type="number"
                  name="gst"
                  value={settings.gst}
                  onChange={handleInputChange}
                  placeholder="18"
                />
              </div>
              <div className="form-group">
                <label>Delivery Fee (₹)</label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={settings.deliveryFee}
                  onChange={handleInputChange}
                  placeholder="50"
                />
              </div>
              <div className="form-group">
                <label>Free Delivery Above (₹) — <small>(0 to disable free delivery)</small></label>
                <input
                  type="number"
                  name="freeDeliveryThreshold"
                  value={settings.freeDeliveryThreshold}
                  onChange={handleInputChange}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          <div className="settings-section dashboard-card">
            <div className="section-title-row">
              <h2>Hero Section Slides</h2>
              <button type="button" className="add-slide-btn" onClick={addHeroSlide}>
                + Add Slide
              </button>
            </div>

            <div className="hero-slides-list">
              {settings.heroSection.map((slide, index) => (
                <div key={index} className="hero-slide-item dashboard-card sub-card">
                  <div className="slide-top">
                    <h3>Slide #{index + 1}</h3>
                    <button type="button" className="remove-slide-btn" onClick={() => removeHeroSlide(index)}>
                      Delete
                    </button>
                  </div>

                  <div className="slide-content-grid">
                    <div className="slide-image-upload">
                      {slide.image ? (
                        <div className="preview-container">
                          <img src={slide.image} alt="Slide Preview" />
                          <label className="change-img-btn">
                            Change Image
                            <input type="file" onChange={(e) => handleImageUpload(e, index)} hidden />
                          </label>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          {uploading === index ? 'Uploading...' : (
                            <label>
                              Upload Image
                              <input type="file" onChange={(e) => handleImageUpload(e, index)} hidden />
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="slide-details">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleHeroChange(index, 'title', e.target.value)}
                          placeholder="Main Headline"
                        />
                      </div>
                      <div className="form-group">
                        <label>Subtitle</label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => handleHeroChange(index, 'subtitle', e.target.value)}
                          placeholder="Supporting Text"
                        />
                      </div>
                      <div className="form-group">
                        <label>Button Link</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => handleHeroChange(index, 'link', e.target.value)}
                          placeholder="/portfolio"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-submit-row">
            <button type="submit" className="form-submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
