import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { BackIcon } from '../../../assets/images/icons.jsx';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        toast.error('Failed to load order details');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleImagePreview = (images, index = 0) => {
    setPreviewImages(images || []);
    setActiveImageIndex(index);
    setIsPreviewOpen(true);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPreviewOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, previewImages]);

  if (loading) return <div className="admin-detail-loading">Loading order details...</div>;
  if (!order) return <div className="admin-detail-error">Order not found.</div>;

  const subtotal = order.subtotal || 0;
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const gst = order.gstAmount || 0;
  const total = order.totalPrice || 0;

  return (
    <div className="admin-detail-page">
      <div className="admin-detail-container">
        <div className="admin-detail-header no-print">
          <div className="order-detail-header-left">
            <button className="detail-back-btn" onClick={() => navigate('/admin/orders')}>
              <BackIcon size={20} />
              <span>Back to Orders</span>
            </button>
            <h1>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
          </div>
          <button className="detail-print-btn" onClick={handlePrint}>Print Invoice</button>
        </div>

        <div className="admin-detail-content">
          {/* Admin UI View (Picking List) */}
          <div className="detail-ui-section no-print">
            <div className="section-title">
              <h3>Picking List</h3>
              <p>Visual guide for product fulfillment</p>
            </div>

            <div className="picking-grid">
              {order.items.map((item, idx) => (
                <div key={idx} className="picking-card">
                  <div 
                    className="picking-img-wrapper" 
                    onClick={() => handleImagePreview(item.images?.length > 0 ? item.images.map(img => img.url) : [item.image])}
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span className="picking-qty-badge">{item.quantity}</span>
                  </div>
                  <div className="picking-info">
                    <h4>{item.name}</h4>
                    {item.selectedColor && (
                      <div className="picking-color">
                        <span className="color-label">Color:</span>
                        {item.selectedColor.startsWith('#') ? (
                          <span className="color-swatch" style={{ background: item.selectedColor }}></span>
                        ) : (
                          <span className="color-text">{item.selectedColor}</span>
                        )}
                      </div>
                    )}
                    <div className="picking-price">₹{item.price.toFixed(2)}</div>
                  </div>

                </div>
              ))}
            </div>

            <div className="detail-info-grid">
              <div className="info-block">
                <h4>Customer & Shipping</h4>
                <div className="info-card">
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                  <p>Phone: {order.shippingAddress?.phone}</p>
                  <p>Email: {order.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="info-block">
                <h4>Payment & Summary</h4>
                <div className="info-card">
                  <div className="summary-row"><span>Method</span><span>{order.paymentMethod}</span></div>
                  <div className="summary-row"><span>Status</span><span className={`status-text status-${order.status}`}>{order.status}</span></div>
                  <div className="summary-divider"></div>
                  <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                  <div className="summary-row"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Delivery</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                  <div className="summary-row total"><span>Grand Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Printable Invoice (Always rendered but hidden in UI via CSS) */}
          <div className="invoice-printable" id="printable-invoice">
            <div className="invoice-header">
              <div className="invoice-company">
                <h1>Navinila & Co</h1>
                <p>DRS Complex, Marriyamman Kovil Street</p>
                <p>Chetpet, Thiruvanamalai, 606801</p>
                <p>Phone: 7010797948</p>
              </div>
              <div className="invoice-title">
                <h2>INVOICE</h2>
                <p>Order ID: <span>#{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                <p>Date: <span>{new Date(order.createdAt).toLocaleDateString()}</span></p>
              </div>
            </div>

            <div className="invoice-billing-row">
              <div className="billing-col">
                <h3>Bill To:</h3>
                <strong>{order.shippingAddress?.fullName}</strong>
                <p>{order.shippingAddress?.addressLine1}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
              <div className="billing-col">
                <h3>Payment:</h3>
                <p>{order.paymentMethod}</p>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="item-name">{item.name}</div>
                      {item.selectedColor && <div className="item-meta">Color: {item.selectedColor}</div>}
                    </td>
                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-footer">
              <div className="footer-notes">
                <h3>Notes:</h3>
                <p>Thank you for shopping with Navinila & Co!</p>
              </div>
              <div className="footer-summary">
                <div className="summary-row"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="summary-row"><span>Discount:</span><span>-₹{discount.toFixed(2)}</span></div>}
                <div className="summary-row"><span>GST:</span><span>₹{gst.toFixed(2)}</span></div>
                <div className="summary-row"><span>Delivery:</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total:</span><span>₹{total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal (Carousel) */}
      {isPreviewOpen && previewImages.length > 0 && (
        <div className="image-preview-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={() => setIsPreviewOpen(false)}>×</button>
            
            <div className="carousel-main">
              {previewImages.length > 1 && (
                <button className="carousel-nav prev" onClick={prevImage}>‹</button>
              )}
              
              <img src={previewImages[activeImageIndex]} alt="Preview" className="full-preview-image" />
              
              {previewImages.length > 1 && (
                <button className="carousel-nav next" onClick={nextImage}>›</button>
              )}
            </div>

            {previewImages.length > 1 && (
              <div className="carousel-footer">
                <div className="image-counter">{activeImageIndex + 1} / {previewImages.length}</div>
                <div className="thumbnail-strip">
                  {previewImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`thumb-item ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumb ${idx}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;
