import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { setCart } from '../../redux/userSlice';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((state) => state.user);
  const cart = userInfo?.cart || [];

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [updating, setUpdating] = useState(null); // productId being updated
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ gst: 0, deliveryFee: 0 });

  useEffect(() => {
    const fetchCartAndSettings = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const [cartRes, settingsRes] = await Promise.all([
          api.get('/users/cart'),
          api.get('/settings')
        ]);
        dispatch(setCart(cartRes.data));
        setSettings(settingsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartAndSettings();
  }, [isAuthenticated, dispatch]);

  const handleQtyChange = async (productId, newQty, selectedColor) => {
    // ... existing logic ...
    const item = cart.find(i => {
      const pid = i.product?._id ? i.product._id.toString() : i.product?.toString();
      const matchId = pid === productId.toString();
      const matchColor = (i.selectedColor || null) === (selectedColor || null);
      return matchId && matchColor;
    });

    if (!item) return;

    let availableStock = item.product?.countInStock || 0;
    if (item.selectedColor && item.product?.colors?.length > 0) {
      const variant = item.product.colors.find(c =>
        (c.name?.toLowerCase().trim() === item.selectedColor.toLowerCase().trim()) ||
        (c.code?.toLowerCase().trim() === item.selectedColor.toLowerCase().trim())
      );
      if (variant) availableStock = variant.countInStock;
    }

    if (newQty > item.quantity && newQty > availableStock) {
      toast.warning(`Only ${availableStock} units available`);
      return;
    }

    const colorParam = selectedColor || "null";
    setUpdating(`${productId}-${colorParam}`);

    try {
      if (newQty > 0) {
        const { data } = await api.put('/users/cart', {
          productId,
          quantity: newQty,
          selectedColor: selectedColor || null
        });
        dispatch(setCart(data.cart));
      } else {
        const { data } = await api.delete(`/users/cart/${productId}`, {
          params: { selectedColor: colorParam }
        });
        dispatch(setCart(data.cart));
      }
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId, selectedColor) => {
    const colorParam = selectedColor || "null";
    setUpdating(`${productId}-${colorParam}`);
    try {
      const { data } = await api.delete(`/users/cart/${productId}`, {
        params: { selectedColor: colorParam }
      });
      dispatch(setCart(data.cart));
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const { data } = await api.post('/coupons/validate', { code, cartTotal: subtotal });
      setAppliedPromo(data);
      toast.success(`Coupon "${code}" applied!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const deliveryFee = (subtotal > 0)
    ? (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee)
    : 0;
  const gstAmount = (subtotal * settings.gst) / 100;
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = subtotal + deliveryFee + gstAmount - discount;

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h2>Sign in to view your cart</h2>
          <p>Please log in to access your saved items.</p>
          <Link to="/" className="cart-continue-btn">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="cart-continue-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="cart-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="cart-title">Your Cart
          <span className="cart-count-badge">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
        </h1>
      </div>

      <div className="cart-layout">
        {/* Left: Items */}
        <div className="cart-items-section">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;

            // Find variant image
            let variantImage = product.image;
            if (item.selectedColor && product.colors?.length > 0) {
              const variant = product.colors.find(c => c.name === item.selectedColor || c.code === item.selectedColor);
              if (variant?.images?.length > 0) {
                variantImage = variant.images[0].url;
              }
            }

            const originalPrice = product.discount > 0
              ? (product.price * 100 / (100 - product.discount)).toFixed(2)
              : null;

            return (
              <div key={`${product._id}-${item.selectedColor}`} className={`cart-item-card ${updating === `${product._id}-${item.selectedColor}` ? 'updating' : ''}`}>
                <Link to={`/product/${product._id}`} className="cart-item-image-link">
                  <img src={variantImage} alt={product.name} className="cart-item-img" />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/product/${product._id}`} className="cart-item-name">{product.name}</Link>
                  <div className="cart-item-meta-row">
                    {product.brand && <span className="cart-item-brand">{product.brand}</span>}
                    {item.selectedColor && !item.selectedColor.startsWith('#') && (
                      <span className="cart-item-color-badge">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">₹{product.price.toFixed(2)}</span>
                    {originalPrice && <span className="cart-item-original">₹{originalPrice}</span>}
                    {product.discount > 0 && <span className="cart-item-discount">-{product.discount}%</span>}
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div className="cart-qty-counter">
                    <button
                      className="cart-qty-btn"
                      onClick={() => handleQtyChange(product._id, item.quantity - 1, item.selectedColor)}
                      disabled={updating === `${product._id}-${item.selectedColor}`}
                    >−</button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => handleQtyChange(product._id, item.quantity + 1, item.selectedColor)}
                      disabled={updating === `${product._id}-${item.selectedColor}`}
                    >+</button>
                  </div>
                  <p className="cart-item-subtotal">${(product.price * item.quantity).toFixed(2)}</p>
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(product._id, item.selectedColor)}
                    disabled={updating === `${product._id}-${item.selectedColor}`}
                    aria-label="Remove item"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary */}
        <div className="cart-summary-section">
          {/* Promo Code */}
          <div className="cart-promo-card">
            <h3 className="cart-section-label">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Promo Code
            </h3>
            {appliedPromo ? (
              <div className="cart-promo-applied">
                <span>✓ <strong>{appliedPromo.code}</strong> — {appliedPromo.label}</span>
                <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }}>Remove</button>
              </div>
            ) : (
              <div className="cart-promo-input-row">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  className="cart-promo-input"
                />
                <button className="cart-promo-btn" onClick={handleApplyPromo}>Apply</button>
              </div>
            )}
          </div>

          {/* Fare Breakdown */}
          <div className="cart-fare-card">
            <h3 className="cart-section-label">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Order Summary
            </h3>

            <div className="cart-fare-row">
              <span>Subtotal ({cart.length} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {appliedPromo && (
              <div className="cart-fare-row discount">
                <span>Discount ({appliedPromo.code})</span>
                <span>−₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="cart-fare-row">
              <span>GST ({settings.gst}%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>

            <div className="cart-fare-row">
              <span>Delivery</span>
              <span>
                {deliveryFee === 0
                  ? <span className="free-tag">FREE</span>
                  : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            {settings.freeDeliveryThreshold > 0 && subtotal < settings.freeDeliveryThreshold && (
              <p className="cart-free-delivery-hint">
                Add ₹{(settings.freeDeliveryThreshold - subtotal).toFixed(2)} more for free delivery
              </p>
            )}

            <div className="cart-fare-divider" />

            <div className="cart-fare-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={() => navigate('/checkout', { state: { subtotal, discount, deliveryFee, gstAmount, total, appliedPromo } })}
            >
              Proceed to Checkout
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <Link to="/" className="cart-continue-link">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
