import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { BackIcon } from '../../assets/images/icons.jsx';
import './AllProducts.css';
import ProductCard from '../commonComponents/ProductCard/ProductCard.jsx';
import Pagination from '../commonComponents/Pagination/Pagination.jsx';

const AllProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?pageNumber=${page}&pageSize=10`);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="cat-products-container">
      {/* Back Button */}
      <button className="cat-back-btn" onClick={() => navigate(-1)}>
        <BackIcon size={18} strokeWidth={2.5} />
        Back
      </button>

      {/* Header */}
      <div className="cat-products-header all-prods-header">
        <div className="cat-header-content">
          <p className="cat-breadcrumb">Shop / All Products</p>
          <h1 className="cat-title">Our Collection</h1>
          {!loading && (
            <span className="cat-count">{total} Items Available</span>
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
          <h3>No products found</h3>
          <button className="cat-back-btn" onClick={() => navigate('/')}>← Go Home</button>
        </div>
      ) : (
        <>
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

          <Pagination
            page={page}
            pages={pages}
            onChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default AllProducts;
