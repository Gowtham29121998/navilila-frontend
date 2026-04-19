import React from 'react';
import Header from './Header/Index';
import Footer from './Footer/Index';
import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <div>
      <Header />
      <main style={{ minHeight: '70vh' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
