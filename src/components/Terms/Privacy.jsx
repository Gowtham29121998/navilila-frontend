import React, { useEffect } from 'react';
import './Terms.css'; // Reusing Terms styles for consistency

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: May 06, 2026</p>
      </div>

      <div className="terms-content">
        <section className="terms-section">
          <h2>Data Collection</h2>
          <p>
            We collect information You provide directly to Us, such as when You create an account, 
            place an order, or contact customer support. This may include Your name, email address, 
            and shipping information.
          </p>
        </section>

        <section className="terms-section">
          <h2>Security</h2>
          <p>
            The security of Your Personal Data is important to Us, but remember that no method of 
            transmission over the Internet, or method of electronic storage is 100% secure. 
            While We strive to use commercially acceptable means to protect Your Personal Data, 
            We cannot guarantee its absolute security.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
