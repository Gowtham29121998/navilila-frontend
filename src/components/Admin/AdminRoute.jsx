import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { isAuthenticated, userInfo } = useSelector((state) => state.user);

  return isAuthenticated && userInfo?.role === 'ADMIN' ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;
