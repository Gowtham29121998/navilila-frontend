import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { setCart, setFavorites } from '../../../redux/userSlice';
import { toggleAuthModal } from '../../../redux/navigationSlice';
import './ProductCard.css';

const ProductCard = ({ id, image, name, price = 0, discount = 0 }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector((state) => state.user);
  
  const isFavorite = userInfo?.favorites?.includes(id);
  const cartItem = userInfo?.cart?.find(item => item.product?._id === id || item.product === id);

  const originalPrice = discount > 0 ? (price * 100 / (100 - discount)).toFixed(2) : null;

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(toggleAuthModal(true));
      return;
    }
    
    try {
      if (isFavorite) {
        const { data } = await api.delete(`/users/favorites/${id}`);
        dispatch(setFavorites(data.favorites));
        toast.info("Removed from favorites");
      } else {
        const { data } = await api.post('/users/favorites', { productId: id });
        dispatch(setFavorites(data.favorites));
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update favorites");
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(toggleAuthModal(true));
      return;
    }
    
    try {
      const { data } = await api.post('/users/cart', { productId: id, quantity: 1 });
      dispatch(setCart(data.cart));
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await api.put('/users/cart', { productId: id, quantity: cartItem.quantity + 1 });
      dispatch(setCart(data.cart));
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrement = async (e) => {
    e.stopPropagation();
    try {
      if (cartItem.quantity > 1) {
        const { data } = await api.put('/users/cart', { productId: id, quantity: cartItem.quantity - 1 });
        dispatch(setCart(data.cart));
      } else {
        const { data } = await api.delete(`/users/cart/${id}`);
        dispatch(setCart(data.cart));
        toast.info("Removed from cart");
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${id}`} className="product-card-visual-link">
          <img src={image} alt={name} className="product-image" />
        </Link>
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Toggle favorite"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="product-info">
        <Link to={`/product/${id}`} className="product-card-info-link">
          <h3 className="product-title">{name}</h3>
          <div className="product-price-row">
            <span className="current-price">${price}</span>
            {discount > 0 && (
              <>
                <span className="original-price">${originalPrice}</span>
                <span className="discount-tag">-{discount}%</span>
              </>
            )}
          </div>
        </Link>

        <div className="product-actions">
          {cartItem ? (
            <div className="qty-counter">
              <button className="qty-btn" onClick={handleDecrement} aria-label="Decrease quantity">−</button>
              <span className="qty-value">{cartItem.quantity}</span>
              <button className="qty-btn" onClick={handleIncrement} aria-label="Increase quantity">+</button>
            </div>
          ) : (
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
