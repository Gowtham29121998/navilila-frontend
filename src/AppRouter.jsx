import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import Layout from './components/Layout/index.jsx';
import Index from './components/Home/index.jsx';
import About from './components/About/index.jsx';
import NotFound from './components/NotFound/NotFound';

// Admin Imports
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './components/Admin/Dashboard/AdminDashboard';
import AdminProducts from './components/Admin/Products/AdminProducts';
import AdminCategories from './components/Admin/Categories/AdminCategories';
import AdminUsers from './components/Admin/Users/AdminUsers';
import AdminOrders from './components/Admin/Orders/AdminOrders';
import AdminSettings from './components/Admin/Settings/AdminSettings';
import AdminCoupons from './components/Admin/Coupons/AdminCoupons';
import ProductDetails from './components/ProductDetails/ProductDetails';
import CategoryProducts from './components/CategoryProducts/CategoryProducts';
import CartPage from './components/Cart/CartPage';
import CheckoutPage from './components/Checkout/CheckoutPage';
import Profile from './components/Profile/Profile';
import MyOrders from './components/MyOrders/MyOrders';
import ResetPassword from './components/Auth/ResetPassword';

const AppRouter = () => {
  const { userInfo } = useSelector((state) => state.user);
  const isAdmin = userInfo && userInfo.role === 'ADMIN';

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Index />} />
        <Route path="about" element={<About />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="category/:categoryId" element={<CategoryProducts />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        
        {/* Admin Private Routes */}
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="sales" element={<div style={{padding: '2rem', color: 'white'}}>Sales Page (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Router>
  );
};

export default AppRouter;
