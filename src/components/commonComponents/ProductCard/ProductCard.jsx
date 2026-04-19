import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { setCart, setFavorites } from '../../../redux/userSlice';
import { toggleAuthModal } from '../../../redux/navigationSlice';
import { HeartIcon } from '../../../assets/images/icons.jsx';
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
          <HeartIcon 
            size={20} 
            fill={isFavorite ? "#ef4444" : "none"} 
            stroke={isFavorite ? "#ef4444" : "currentColor"} 
          />
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


      </div>
    </div>
  );
};

export default ProductCard;
