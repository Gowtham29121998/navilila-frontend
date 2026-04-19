import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ProductCard from '../commonComponents/ProductCard/ProductCard';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products/category/${categoryId}`),
          api.get('/categories'),
        ]);
        setProducts(productsRes.data);
        const found = categoriesRes.data.find(c => c._id === categoryId);
        setCategory(found || null);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchData();
  }, [categoryId]);

  return (
    <div className="cat-products-container">
      {/* Back Button */}
      <button className="cat-back-btn" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="cat-products-header">
        {category?.image?.url && (
          <div className="cat-hero-img-wrapper">
            <img src={category.image.url} alt={category.name} className="cat-hero-img" />
            <div className="cat-hero-overlay" />
          </div>
        )}
        <div className="cat-header-content">
          <p className="cat-breadcrumb">Shop / {category?.name || 'Category'}</p>
          <h1 className="cat-title">{category?.name || 'Products'}</h1>
          {!loading && (
            <span className="cat-count">{products.length} {products.length === 1 ? 'product' : 'products'}</span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="cat-loader">
          <div className="cat-spinner" />
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="cat-empty">
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h3>No products yet</h3>
          <p>Products in this category will appear here once added.</p>
          <button className="cat-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      ) : (
        <div className="cat-products-grid">
          {products.map(product => (
            <ProductCard
              key={product._id}
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              discount={product.discount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
