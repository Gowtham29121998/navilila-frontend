import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { setCart } from '../../redux/userSlice';
import './CheckoutPage.css';

// ── Constants ──────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: 'India',
  lat: null, lng: null,
};

// ── Parse Nominatim address object into form fields ────────────────────────
const parseNominatim = (a) => ({
  addressLine1: [a.house_number, a.road, a.suburb, a.quarter].filter(Boolean).join(', '),
  addressLine2: a.neighbourhood || a.hamlet || '',
  city: a.city || a.town || a.municipality || a.village || a.county || '',
  state: a.state || '',
  postalCode: a.postcode || '',
  country: a.country || '',
});

// ── Component ──────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo, isAuthenticated } = useSelector((state) => state.user);

  const orderSummary = location.state || {};
  const cart = userInfo?.cart || [];

  // ── State ──────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Pincode debounce ref
  const pinLookupTimer = useRef(null);

  // ── Fetch addresses ────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
    } catch {
      toast.error('Failed to load addresses');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return; }
    fetchAddresses();
  }, [isAuthenticated, navigate, fetchAddresses]);

  // ── Nominatim reverse geocode: lat/lng → address ───────────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'ElevateShopApp/1.0' } }
      );
      const data = await res.json();
      if (data?.address) {
        const parsed = parseNominatim(data.address);
        setForm((prev) => ({ ...prev, ...parsed, lat, lng }));
        return parsed;
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
    return null;
  }, []);

  // ── Postal code lookup → update state + country + city ─────────────────
  const lookupPostalCode = useCallback(async (pin, country) => {
    if (!pin || pin.length < 4) return;
    if (/^\d{6}$/.test(pin)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setForm((prev) => ({
            ...prev,
            state: po.State || prev.state,
            country: 'India',
            city: po.District || po.Block || prev.city,
          }));
          toast.info(`📍 ${po.State}, ${po.District || po.Block} — auto-filled`, { autoClose: 2500 });
          return;
        }
      } catch { }
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pin}&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'ElevateShopApp/1.0' } }
      );
      const data = await res.json();
      if (data.length > 0 && data[0].address) {
        const a = data[0].address;
        setForm((prev) => ({
          ...prev,
          state: a.state || prev.state,
          country: a.country || prev.country,
          city: a.city || a.town || a.municipality || a.village || prev.city,
        }));
      }
    } catch (err) { }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setForm((prev) => ({ ...prev, lat, lng }));
        await reverseGeocode(lat, lng);
        setLocLoading(false);
      },
      () => {
        toast.error('Failed to get location');
        setLocLoading(false);
      }
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'postalCode') {
      clearTimeout(pinLookupTimer.current);
      pinLookupTimer.current = setTimeout(() => {
        lookupPostalCode(value, form.country);
      }, 600);
    }
  };

  const openAddForm = () => { setEditingAddress(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setForm({ ...addr, addressLine2: addr.addressLine2 || '' });
    setShowForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingAddress) {
        const { data } = await api.put(`/addresses/${editingAddress._id}`, form);
        setAddresses(prev => prev.map(a => a._id === data._id ? data : a));
      } else {
        const { data } = await api.post('/addresses', form);
        setAddresses(prev => [data, ...prev]);
        setSelectedAddressId(data._id);
      }
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch { }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
    } catch { }
  };

  const [settings, setSettings] = useState({ gst: 0, deliveryFee: 0, freeDeliveryThreshold: 0 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (err) { }
    };
    fetchSettings();
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────
  const subtotal = orderSummary.subtotal ?? cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  
  const deliveryFee = orderSummary.deliveryFee ?? (
    (subtotal > 0) 
      ? (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee)
      : 0
  );

  const gstAmount = orderSummary.gstAmount ?? ((subtotal * settings.gst) / 100);
  const discount = orderSummary.discount ?? 0;
  const total = orderSummary.total ?? (subtotal + deliveryFee + gstAmount - discount);

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setPlaceOrderLoading(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod,
        promoCode: orderSummary.appliedPromo?.code || '',
        discount,
        deliveryFee,
        gstAmount
      };

      if (paymentMethod === 'Razorpay') {
        const res = await loadRazorpay();
        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setPlaceOrderLoading(false);
          return;
        }

        // 1. Create Razorpay order intent
        const { data: paymentOrder } = await api.post('/payment/razorpay', {
          amount: total
        });

        const options = {
          key: 'rzp_test_SfGeMxvHevaCzi',
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'Elevate Shop',
          description: 'Secure Payment for Order',
          order_id: paymentOrder.id,
          handler: async (response) => {
            try {
              // 2. Verify Payment AND Create Order in one atomic step
              await api.post('/payment/verify', {
                ...response,
                orderDetails: orderData
              });
              dispatch(setCart([]));
              toast.success('Payment successful! Order confirmed.');
              navigate('/');
            } catch (err) {
              toast.error('Payment verification failed. Please contact support.');
            } finally {
               setPlaceOrderLoading(false);
            }
          },
          prefill: {
            name: userInfo.username,
            contact: userInfo.phone
          },
          theme: { color: '#38bdf8' },
          modal: {
            ondismiss: () => {
                toast.info('Payment cancelled');
                setPlaceOrderLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD path: standard order creation
        await api.post('/orders', orderData);
        dispatch(setCart([]));
        toast.success('Order placed successfully!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPlaceOrderLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span><span className="step-label">Address</span>
        </div>
        <div className="step-line" />
        <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span><span className="step-label">Payment</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 ? (
            <>
              <div className="checkout-section-header">
                <h2>Delivery Address</h2>
                <button className="checkout-add-addr-btn" onClick={openAddForm}>+ Add New</button>
              </div>

              <div className="address-list">
                {addresses.map((addr) => (
                  <div key={addr._id} className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`} onClick={() => setSelectedAddressId(addr._id)}>
                    <div className="address-card-radio"><div className={`radio-dot ${selectedAddressId === addr._id ? 'active' : ''}`} /></div>
                    <div className="address-card-body">
                      <strong>{addr.fullName}</strong> — {addr.phone}
                      <p>{addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                    <div className="address-card-actions" onClick={e => e.stopPropagation()}>
                      <button className="addr-edit-btn" onClick={() => openEditForm(addr)}>
                        Edit
                      </button>
                      <button className="addr-delete-btn" onClick={() => handleDeleteAddress(addr._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showForm && (
                <div className="address-form-card">
                  <form onSubmit={handleSaveAddress}>
                    <input name="fullName" value={form.fullName} onChange={handleFormChange} placeholder="Full Name" required />
                    <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone" required />
                    <input name="addressLine1" value={form.addressLine1} onChange={handleFormChange} placeholder="Address" required />
                    <input name="city" value={form.city} onChange={handleFormChange} placeholder="City" required />
                    <input name="state" value={form.state} onChange={handleFormChange} placeholder="State" required />
                    <input name="postalCode" value={form.postalCode} onChange={handleFormChange} placeholder="Pincode" required />
                    <div className="addr-form-actions">
                      <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                      <button type="submit" disabled={formLoading}>Save</button>
                    </div>
                  </form>
                </div>
              )}

              <button className="checkout-next-btn" disabled={!selectedAddressId} onClick={() => setStep(2)}>Continue</button>
            </>
          ) : (
            <div className="payment-section">
              <button className="checkout-back-step-btn" onClick={() => setStep(1)}>Back</button>
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div 
                  className={`payment-method-card ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                >
                  <div className={`pm-radio ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`} />
                  <strong>Cash on Delivery</strong>
                </div>

                <div 
                  className={`payment-method-card ${paymentMethod === 'Razorpay' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Razorpay')}
                >
                  <div className={`pm-radio ${paymentMethod === 'Razorpay' ? 'active' : ''}`} />
                  <div className="payment-method-info">
                    <strong>Razorpay</strong>
                    <span>Cards, UPI, Netbanking</span>
                  </div>
                </div>
              </div>
              <button className="checkout-place-order-btn" onClick={handlePlaceOrder} disabled={placeOrderLoading}>
                {placeOrderLoading ? 'Processing...' : (paymentMethod === 'Razorpay' ? `Pay ₹${total.toFixed(2)}` : `Place Order — ₹${total.toFixed(2)}`)}
              </button>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-items-list">
            {cart.map(item => (
              <div key={item._id} className="checkout-item-row">
                <span>{item.product?.name} x {item.quantity}</span>
                <span>₹{(item.product?.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-rows">
            <div className="checkout-summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="checkout-summary-row disc"><span>Discount</span><span>−₹{discount.toFixed(2)}</span></div>}
            <div className="checkout-summary-row"><span>GST</span><span>₹{gstAmount.toFixed(2)}</span></div>
            <div className="checkout-summary-row"><span>Delivery</span><span>₹{deliveryFee.toFixed(2)}</span></div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
