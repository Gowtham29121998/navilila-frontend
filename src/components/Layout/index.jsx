import React from 'react';
import Header from './Header';
import Footer from './Footer';
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
