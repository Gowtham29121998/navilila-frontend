import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '../../../utils/api';
import { LongArrowIcon } from '../../../assets/images/icons.jsx';
import './RecentlyAdded.css';
import ProductCard from '../../commonComponents/ProductCard/ProductCard.jsx';

const RecentlyAdded = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products?pageSize=8');
        setProducts(data.products || []); // Show last 8 products
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
        <Link to="/all-products" className="recent-more-link">
          More
          <LongArrowIcon size={20} className="icon" />
        </Link>
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
