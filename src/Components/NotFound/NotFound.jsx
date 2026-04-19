import React from 'react';
import { Link } from 'react-router';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Lost in Space</h2>
        <p className="notfound-text">
          We couldn't track down the page you're looking for. It might have been moved, deleted, or perhaps it never existed at all. Let's get you back home!
        </p>
        <Link to="/" className="notfound-home-btn">
          Return to Base
        </Link>
      </div>
      <div className="notfound-image-container">
        {/* A beautiful dark-themed astronaut/space image from Unsplash to fit the 404 lost theme */}
        <img 
          src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=800&q=80" 
          alt="Lost Astronaut in Space" 
          className="notfound-image" 
        />
      </div>
    </div>
  );
};

export default NotFound;
