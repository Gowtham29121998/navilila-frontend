import React from 'react';
import HeroSection from './HeroSection/HeroSection';
import CategorySection from './CategorySection/CategorySection';
import RecentlyAdded from './RecentlyAdded/RecentlyAdded';
import './Home.css';

const Index = () => {
  return (
    <div className="home-container">
      <HeroSection />
      <CategorySection />
      <RecentlyAdded />
    </div>
  );
};

export default Index;
