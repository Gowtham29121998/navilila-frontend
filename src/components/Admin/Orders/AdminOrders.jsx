import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../utils/api';
import './AdminOrders.css';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [activeTab, setActiveTab] = useState('All');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const tabs = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => (o._id === orderId ? data : o)));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab !== 'All' && order.status !== activeTab) {
      return false;
    }
    // Date filter
    const orderDate = new Date(order.createdAt);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setDateRange([null, null]);
    setActiveTab('All');
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        <div className="admin-orders-header">
          <h2>Order Management</h2>
        </div>

      {/* TABS */}
      <div className="order-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`order-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* DATE FILTERS */}
      <div className="order-filters">
        <div className="filter-group">
          <label>Date Range</label>
          <DatePicker 
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="Select date range"
            dateFormat="MMM d, yyyy"
            isClearable={true}
          />
        </div>
        {(startDate || endDate || activeTab !== 'All') && (
          <button className="filter-clear-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found for this criteria.</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} onClick={() => handleOrderClick(order._id)} className="order-row-clickable">
                  <td className="order-id-cell">
                    {order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{fontWeight: '600'}}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div style={{fontSize: '0.75rem', color: '#64748b'}}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="order-user-cell">
                    <div>{order.shippingAddress?.fullName}</div>
                    <span>{order.user?.email || 'N/A'}</span>
                  </td>
                  <td className="order-items-cell">
                    <span className="items-count-badge">
                      {order.items?.reduce((sum, i) => sum + i.quantity, 0)} items
                    </span>
                  </td>
                  <td className="order-total-cell">₹{order.totalPrice.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={order.status === 'cancelled'}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminOrders;
