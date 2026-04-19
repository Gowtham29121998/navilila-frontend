import React from 'react';
import logoIcon from '../../assets/logoIcon.png';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <img src={logoIcon} alt="Elevate Logo" className="about-logo" style={{ width: '60px', marginBottom: '1.5rem' }} />
        <h1>Discover Elevate</h1>
        <p>Innovation meets aesthetics. We are a collective of dreamers, builders, and designers striving to build the future of the web.</p>
      </div>

      <div className="about-mission">
        <div className="mission-text">
          <h2>Our Mission</h2>
          <p>
            At Elevate, we believe that great design has the power to transform the way people interact with the digital world. Our mission is to bridge the gap between complex engineering and beautiful, intuitive user experiences.
          </p>
          <p>
            Founded in 2024, our team has relentlessly pushed the boundaries of modern UI and scalable architectures, crafting solutions that not only work flawlessly but look spectacular.
          </p>
        </div>
        <div className="mission-image">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" alt="Team collaborating" />
        </div>
      </div>

      <div className="about-team">
        <h2>Meet the Minds</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="team-avatar">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" alt="Sarah Jenkins" />
            </div>
            <div className="team-info">
              <h3>Sarah Jenkins</h3>
              <p>CEO & Founder</p>
              <p className="bio">Visionary leader with a passion for disruptive design patterns and fostering inclusive team cultures.</p>
            </div>
          </div>

          <div className="team-member">
            <div className="team-avatar">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80" alt="David Chen" />
            </div>
            <div className="team-info">
              <h3>David Chen</h3>
              <p>Lead Engineer</p>
              <p className="bio">Architect behind our core framework. Loves React, performance optimization, and dark-roasted coffee.</p>
            </div>
          </div>

          <div className="team-member">
            <div className="team-avatar">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80" alt="Elena Rodriguez" />
            </div>
            <div className="team-info">
              <h3>Elena Rodriguez</h3>
              <p>Head of Design</p>
              <p className="bio">Award-winning UX/UI designer obsessed with micro-interactions, gradients, and perfect typography.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
