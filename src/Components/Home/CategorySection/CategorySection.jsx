import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './CategorySection.css';
import api from '../../../utils/api';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="category-wrapper">
      <div className="category-header">
        <h2>Categories</h2>
      </div>
      <div className="category-scroll-container">
        {categories && categories.map((category) => (
          <Link key={category._id} to={`/category/${category._id}`} className="category-card">
            <div className="category-image-container">
              <img src={category.image?.url} alt={category.name} className="category-image" />
            </div>
            <h3 className="category-title">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;

