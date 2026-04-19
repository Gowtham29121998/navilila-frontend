import React, { useEffect, useState } from 'react';
import ProductCard from '../../commonComponents/ProductCard/ProductCard';
import api from '../../../utils/api';
import './RecentlyAdded.css';

const RecentlyAdded = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.slice(0, 8)); // Show last 8 products
      } catch (err) {
        console.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="recent-wrapper">
      <div className="recent-header">
        <h2>Recently Added</h2>
        <a href="#more" className="recent-more-link">
          More
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
      <div className="recent-scroll-container">
        {products.map((item) => (
          <ProductCard 
            key={item._id} 
            id={item._id} 
            image={item.image} 
            name={item.name} 
            price={item.price}
            discount={item.discount}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyAdded;
