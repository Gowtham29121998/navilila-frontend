import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    expiryDate: new Date()
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewCoupon(prev => ({ ...prev, expiryDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', newCoupon);
      toast.success('Coupon created successfully');
      setShowModal(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        expiryDate: new Date()
      });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  if (loading) return <div className="admin-loading">Loading coupons...</div>;

  return (
    <div className="admin-page-wrapper">
      <div className="admin-container">
        <header className="page-header">
          <div className="header-info">
            <h1>Promotional Coupons</h1>
            <p>Create and manage discount codes for your customers</p>
          </div>
          <button className="create-action-btn" onClick={() => setShowModal(true)}>
            + Create New Coupon
          </button>
        </header>

        <div className="coupons-grid">
          {coupons.length === 0 ? (
            <div className="no-data-card dashboard-card">
              <p>No coupons found. Create your first one!</p>
            </div>
          ) : (
            coupons.map(coupon => (
              <div key={coupon._id} className="coupon-card dashboard-card">
                <div className="coupon-badge">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </div>
                <div className="coupon-main">
                  <code className="coupon-code">{coupon.code}</code>
                  <div className="coupon-details">
                    <p>Min Purchase: <span>₹{coupon.minPurchase}</span></p>
                    {coupon.maxDiscount && <p>Max Discount: <span>₹{coupon.maxDiscount}</span></p>}
                    <p>Expires: <span className={new Date(coupon.expiryDate) < new Date() ? 'expired' : ''}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span></p>
                  </div>
                </div>
                <button className="card-delete-btn" onClick={() => deleteCoupon(coupon._id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="admin-modal dashboard-card">
              <div className="modal-header">
                <h2>New Coupon</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input 
                    type="text" 
                    name="code" 
                    value={newCoupon.code} 
                    onChange={handleInputChange} 
                    placeholder="SAVE30" 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select name="discountType" value={newCoupon.discountType} onChange={handleInputChange}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input 
                      type="number" 
                      name="discountValue" 
                      value={newCoupon.discountValue} 
                      onChange={handleInputChange} 
                      placeholder="30" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Purchase (₹)</label>
                    <input 
                      type="number" 
                      name="minPurchase" 
                      value={newCoupon.minPurchase} 
                      onChange={handleInputChange} 
                      placeholder="500" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Discount (₹)</label>
                    <input 
                      type="number" 
                      name="maxDiscount" 
                      value={newCoupon.maxDiscount} 
                      onChange={handleInputChange} 
                      placeholder="1000" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <DatePicker
                    selected={newCoupon.expiryDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    className="admin-datepicker"
                  />
                </div>

                <button type="submit" className="form-submit-btn">Create Coupon</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
