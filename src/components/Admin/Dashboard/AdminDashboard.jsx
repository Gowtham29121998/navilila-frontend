import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('month'); // 'day', 'month', 'year'
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let url = `/dashboard/stats?range=${range}`;
        if (range === 'day') url += `&targetMonth=${targetMonth}&targetYear=${targetYear}`;
        if (range === 'month') url += `&targetYear=${targetYear}`;
        
        const { data } = await api.get(url);
        setData(data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [range, targetMonth, targetYear]);

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { stats, salesGrowth, recentOrders } = data;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem'}}>
          <div style={{flex: '1', minWidth: '300px'}}>
            <h1>Analytics Overview</h1>
            <p style={{color: '#94a3b8', marginTop: '4px'}}>
              Exploring <b>{range}ly</b> data for 
              {range === 'day' && ` ${monthNames[targetMonth-1]} ${targetYear}`}
              {range === 'month' && ` ${targetYear}`}
              {range === 'year' && ` the last 5 years`}
            </p>
          </div>

          <div className="dashboard-controls" style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
            {/* RANGE TYPE (Day/Month/Year) */}
            <div className="range-selector" style={{display: 'flex', background: 'rgba(30,41,59,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)'}}>
              {['day', 'month', 'year'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRange(r)}
                  className={range === r ? 'active' : ''}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: range === r ? '#38bdf8' : 'transparent',
                    color: range === r ? '#0f172a' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* PERIOD NAVIGATION (Month/Year Dropdowns) */}
            <div style={{display: 'flex', gap: '0.5rem'}}>
              {(range === 'day') && (
                <select 
                  value={targetMonth} 
                  onChange={(e) => setTargetMonth(Number(e.target.value))}
                  style={{padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155'}}
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              )}
              
              {(range === 'day' || range === 'month') && (
                <select 
                  value={targetYear} 
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  style={{padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155'}}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue.toLocaleString()}</p>
              <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{stats.totalOrders} Orders</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-purple">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-green">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Customers</h3>
              <p>{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-orange">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.15 15-.85-2 M12 2v3 M12 19v3 M5.3 5.3l1.4 1.4 M17.3 17.3l1.4 1.4 M2 12h3 M19 12h3 M5.3 18.7l1.4-1.4 M17.3 6.7l1.4-1.4"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <div className="stat-info">
              <h3>Inventory</h3>
              <div className="inventory-visual" style={{marginTop: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px', fontWeight: '600'}}>
                  <span style={{color: '#22c55e'}}>IN STOCK</span>
                  <span style={{color: '#94a3b8'}}>{stats.inStockProducts} / {stats.totalProducts}</span>
                </div>
                <div className="prog-bar" style={{height: '6px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '3px', overflow: 'hidden', display: 'flex'}}>
                  <div style={{
                    width: `${(stats.inStockProducts / stats.totalProducts) * 100}%`, 
                    height: '100%', 
                    background: '#22c55e',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
                  }}></div>
                </div>
                <div style={{marginTop: '6px', fontSize: '0.65rem', color: '#ef4444', fontWeight: '700', letterSpacing: '0.5px'}}>
                   {stats.outOfStockProducts > 0 ? `${stats.outOfStockProducts} PRODUCTS OUT OF STOCK` : 'ALL ITEMS IN STOCK'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <section className="chart-section">
          <div className="chart-header">
            <h2>Revenue Growth ({range})</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesGrowth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#38bdf8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="dashboard-bottom-grid">
          {/* Recent Orders */}
          <section className="dashboard-card">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all-btn">View All</Link>
            </div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <div className="user-display">
                        <div className="user-avatar-fallback-small" style={{width: '28px', height: '28px', fontSize: '0.7rem'}}>
                          {order.shippingAddress?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{fontSize: '0.85rem'}}>
                          {order.shippingAddress?.fullName?.split(' ')[0]}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontSize: '0.8rem', fontWeight: '600'}}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div style={{fontSize: '0.7rem', color: '#64748b'}}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{fontWeight: '700'}}>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-indicator status-${order.status}`} style={{
                        background: order.status === 'delivered' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                        color: order.status === 'delivered' ? '#22c55e' : '#eab308'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Activity/Search Stuff (Placeholder for 'deb search' or quick stats) */}
          <section className="dashboard-card">
            <div className="card-header">
              <h2>Orders Distribution</h2>
            </div>
            <div className="chart-container" style={{height: '250px'}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesGrowth}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" fontSize={10} stroke="#64748b" axisLine={false} tickLine={false} />
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                   />
                   <Bar dataKey="orders" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(15,23,42,0.4)', borderRadius: '12px'}}>
              <h4 style={{fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem'}}>Quick Insights</h4>
              <p style={{fontSize: '0.85rem', color: '#e2e8f0'}}>You have <b>{stats.totalOrders}</b> total orders across <b>{stats.totalUsers}</b> unique customers.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
