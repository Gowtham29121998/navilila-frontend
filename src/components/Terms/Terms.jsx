import React, { useEffect } from 'react';
import './Terms.css';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
        <p>Last updated: May 06, 2026</p>
        <p className="terms-intro">Please read these terms and conditions carefully before using Our Service.</p>
      </div>

      <div className="terms-content">
        <section className="terms-section">
          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          
          <h3>Definitions</h3>
          <p>For the purposes of these Terms and Conditions:</p>
          <ul className="terms-list">
            <li><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares.</li>
            <li><strong>Country</strong> refers to: Tamil Nadu, India.</li>
            <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our") refers to Navinila & co, DRS Complex, Marriyamman Kovil Street, Chetpet, Thiruvanamalai, 606801.</li>
            <li><strong>Service</strong> refers to the Website.</li>
            <li><strong>Website</strong> refers to Navinila, accessible from http://localhost:5173/</li>
            <li><strong>You</strong> means the individual or legal entity accessing or using the Service.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Acknowledgment</h2>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. They set out the rights and obligations of all users.</p>
          <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. You represent that you are over the age of 18.</p>
        </section>

        <section className="terms-section">
          <h2>User Accounts</h2>
          <p>
            When You create an account with Us, You must provide information that is accurate, 
            complete, and current at all times. Failure to do so constitutes a breach of the Terms, 
            which may result in immediate termination of Your account.
          </p>
          <p>You are responsible for safeguarding Your password and for any activities under it. You agree not to disclose Your password to any third party.</p>
        </section>

        <section className="terms-section">
          <h2>Purchases & Goods</h2>
          <p>
            The Service allows You to purchase goods, products, or items. By making a purchase, 
            You agree to provide current, complete, and accurate purchase and account information.
          </p>
          <p>We reserve the right to refuse or cancel Your order at any time for reasons including product availability, errors in pricing, or suspected fraud.</p>
        </section>

        <section className="terms-section">
          <h2>Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain 
            the exclusive property of Navinila & co and its licensors.
          </p>
          <p>The Service is protected by copyright, trademark, and other laws of India. Our trademarks may not be used without prior written consent.</p>
        </section>

        <section className="terms-section">
          <h2>Links to Other Websites</h2>
          <p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company. We strongly advise You to read their terms and privacy policies.</p>
        </section>

        <section className="terms-section">
          <h2>Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, in no event shall the Company be liable for any special, incidental, indirect, or consequential damages whatsoever.</p>
        </section>

        <section className="terms-section">
          <h2>"AS IS" and "AS AVAILABLE" Disclaimer</h2>
          <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind.</p>
        </section>

        <section className="terms-section">
          <h2>Governing Law</h2>
          <p>The laws of Tamil Nadu, India, shall govern these Terms and Your use of the Service.</p>
        </section>

        <section className="terms-section">
          <h2>Changes to These Terms</h2>
          <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. By continuing to access Our Service after those revisions become effective, You agree to be bound by the revised terms.</p>
        </section>

        <section className="terms-section">
          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
          <ul className="terms-list">
            <li><strong>By phone:</strong> 7010797948</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Terms;
