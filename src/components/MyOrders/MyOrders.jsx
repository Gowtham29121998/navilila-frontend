import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div className="my-orders-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading orders...</div>;
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <div className="my-orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your recent bookings</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <svg className="orders-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
            <h3>No Orders Yet</h3>
            <p>Looks like you haven't made any bookings. Start exploring our products!</p>
            <Link to="/" className="orders-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-header-info">
                    <div className="order-info-block">
                      <span className="order-info-label">Order Placed</span>
                      <span className="order-info-val">
                        {new Date(order.createdAt).toLocaleDateString()} 
                        <span style={{fontSize: '0.75rem', opacity: 0.7, marginLeft: '6px'}}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                    <div className="order-info-block">
                      <span className="order-info-label">Total</span>
                      <span className="order-info-val">${order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="order-info-block">
                      <span className="order-info-label">Order #</span>
                      <span className="order-info-val">{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className={`order-status-badge status-${order.status}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-items-scroll">
                  {order.items.map((item) => (
                    <div key={item._id || item.product._id} className="order-item-row">
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <div className="order-item-details">
                        <div className="order-item-name">{item.name}</div>
                        <div className="order-item-meta">
                          <span className="order-item-qty">Qty: {item.quantity}</span>
                          {item.selectedColor && !item.selectedColor.startsWith('#') && (
                            <span className="order-item-color">{item.selectedColor}</span>
                          )}
                        </div>
                      </div>
                      <div className="order-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span className="order-info-label" style={{ marginRight: '1rem', lineHeight: '2' }}>Payment Method:</span>
                  <span className="order-info-val" style={{ lineHeight: '2' }}>{order.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
