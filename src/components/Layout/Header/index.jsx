import React, { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toggleNavigation, setNavigationOpen, toggleAuthModal } from '../../../redux/navigationSlice';
import { logout } from '../../../redux/userSlice';
import SignUpModal from '../../commonComponents/SignUpModal/SignUpModal.jsx';
import logoIcon from '../../../assets/logoIcon.png';
import logoName from '../../../assets/logoName.png';
import './Header.css';

const Header = () => {
  const isOpen = useSelector((state) => state.navigation.isOpen);
  const isAuthModalOpen = useSelector((state) => state.navigation.isAuthModalOpen);
  const { isAuthenticated, userInfo } = useSelector((state) => state.user);
  const isAdmin = isAuthenticated && userInfo?.role === 'ADMIN';
  const dispatch = useDispatch();

  const handleLinkClick = () => {
    dispatch(setNavigationOpen(false));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(toggleAuthModal(false));
  };

  return (
    <>
      <header className="header">
        {/* Left side: Hamburger (mobile only) & Logo */}
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={() => dispatch(toggleNavigation())} aria-label="Toggle Navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <Link to="/" className="header-logo">
            <img src={logoIcon} alt="Logo Icon" className="logo-icon-img" />
            <img src={logoName} alt="Elevate" className="logo-name-img" />
          </Link>
        </div>

        {/* Center: Navigation Bar (Desktop) */}
        <nav className="header-nav">
          {!isAdmin ? (
            <>
              <NavLink to="/" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
              <NavLink to="/services" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Services</NavLink>
              <NavLink to="/portfolio" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Portfolio</NavLink>
              <NavLink to="/about" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>About Us</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Orders</NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Products</NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Categories</NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Users</NavLink>
              <NavLink to="/admin/coupons" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Coupons</NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Settings</NavLink>
            </>
          )}
        </nav>

        {/* Right side: Auth Action */}
        <div className="header-right">
          {isAuthenticated && (
          <Link to="/cart" className="header-cart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {userInfo?.cart?.length > 0 && (
                <span className="cart-badge">{userInfo.cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
              )}
            </Link>
          )}

          <div className="header-user">
            {isAuthenticated ? (
              <div className="user-profile-container">
                <div className="user-avatar">
                  {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-dropdown">
                  <p className="user-name">{userInfo?.username}</p>
                  <div className="dropdown-links">
                    {!isAdmin && (
                      <>
                        <Link to="/profile" className="dropdown-link">Profile</Link>
                        <Link to="/my-orders" className="dropdown-link">My Orders</Link>
                      </>
                    )}
                  </div>
                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button className="signup-trigger-btn" onClick={() => dispatch(toggleAuthModal(true))}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="header-logo" onClick={handleLinkClick}>Elevate</Link>
          <button className="close-menu-btn" onClick={() => dispatch(setNavigationOpen(false))} aria-label="Close Navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav className="mobile-nav">
          {!isAdmin ? (
            <>
              <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
              <NavLink to="/services" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Services</NavLink>
              <NavLink to="/portfolio" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Portfolio</NavLink>
              <NavLink to="/about" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>About Us</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin/dashboard" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/admin/orders" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Orders</NavLink>
              <NavLink to="/admin/products" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Products</NavLink>
              <NavLink to="/admin/categories" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Categories</NavLink>
              <NavLink to="/admin/users" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Users</NavLink>
              <NavLink to="/admin/coupons" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Coupons</NavLink>
              <NavLink to="/admin/settings" onClick={handleLinkClick} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>Settings</NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Overlay */}
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={() => dispatch(setNavigationOpen(false))}></div>

      {/* Auth Modal */}
      <SignUpModal isOpen={isAuthModalOpen} onClose={() => dispatch(toggleAuthModal(false))} />
    </>
  );
};

export default Header;
