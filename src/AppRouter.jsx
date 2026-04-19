import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import Layout from './Components/Layout/Index';
import Index from './Components/Home';
import About from './Components/About/Index';
import NotFound from './Components/NotFound/NotFound';

// Admin Imports
import AdminRoute from './Components/Admin/AdminRoute';
import AdminDashboard from './Components/Admin/Dashboard/AdminDashboard';
import AdminProducts from './Components/Admin/Products/AdminProducts';
import AdminCategories from './Components/Admin/Categories/AdminCategories';
import AdminUsers from './Components/Admin/Users/AdminUsers';
import AdminOrders from './Components/Admin/Orders/AdminOrders';
import AdminSettings from './Components/Admin/Settings/AdminSettings';
import AdminCoupons from './Components/Admin/Coupons/AdminCoupons';
import ProductDetails from './Components/ProductDetails/ProductDetails';
import CategoryProducts from './Components/CategoryProducts/CategoryProducts';
import CartPage from './Components/Cart/CartPage';
import CheckoutPage from './Components/Checkout/CheckoutPage';
import Profile from './Components/Profile/Profile';
import MyOrders from './Components/MyOrders/MyOrders';

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
