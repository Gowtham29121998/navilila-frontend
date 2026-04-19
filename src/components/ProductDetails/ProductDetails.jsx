import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import SliderImport from 'react-slick';
import api from '../../utils/api';
import { setCart, setFavorites } from '../../redux/userSlice';
import { toggleAuthModal } from '../../redux/navigationSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { HeartIcon, BackIcon, ShareIcon } from '../../assets/images/icons.jsx';
import './ProductDetails.css';

const Slider = SliderImport.default || SliderImport;

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { userInfo, isAuthenticated } = useSelector((state) => state.user);


  const isFavorite = userInfo?.favorites?.includes(id);
  const selectedColorObj = product?.showColors && product?.colors?.length > 0
    ? product.colors[selectedColorIndex]
    : null;
  const selectedColor = selectedColorObj?.name || selectedColorObj?.code || null;

  const cartItem = userInfo?.cart?.find(item =>
    (item.product?._id === id || item.product === id) &&
    (item.selectedColor === selectedColor)
  );

  const fetchData = async () => {
    if (!id || id === 'undefined') return;

    try {
      console.log('Fetching details for product:', id);
      const [productRes, commentsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/comments/${id}`)
      ]);

      setProduct(productRes.data);
      setComments(commentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Data Fetch Error:', error.response || error);
      toast.error(error.response?.data?.message || 'Product not found');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="pd-loader"><div className="spinner"></div></div>;
  if (!product) return <div className="pd-not-found">Product not found. <Link to="/">Return Home</Link></div>;

  const displayImages = product.showColors && product.colors?.length > 0
    ? product.colors[selectedColorIndex].images
    : (product.images?.length > 0 ? product.images : [{ url: product.image }]);

  const originalPrice = product.discount > 0 ? (product.price * 100 / (100 - product.discount)).toFixed(2) : null;

  const sliderSettings = {
    dots: true,
    infinite: displayImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return dispatch(toggleAuthModal(true));
    try {
      const { data } = await api.post('/users/cart', {
        productId: product._id,
        quantity: 1,
        selectedColor: selectedColor
      });
      dispatch(setCart(data.cart));
      toast.success(`Color ${selectedColor || ""} added to cart`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return dispatch(toggleAuthModal(true));
    try {
      if (isFavorite) {
        const { data } = await api.delete(`/users/favorites/${product._id}`);
        dispatch(setFavorites(data.favorites));
        toast.info("Removed from favorites");
      } else {
        const { data } = await api.post('/users/favorites', { productId: product._id });
        dispatch(setFavorites(data.favorites));
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleUpdateQty = async (newQty) => {
    // Determine available stock for this variant
    let availableStock = product.countInStock || 0;
    if (product.showColors && product.colors?.length > 0) {
      const variant = product.colors[selectedColorIndex];
      if (variant) availableStock = variant.countInStock;
    }

    // 3. Prevent exceeding stock
    if (newQty > (cartItem?.quantity || 0) && newQty > availableStock) {
      toast.warning(`Only ${availableStock} units available for ${selectedColor || 'this item'}`);
      return;
    }

    try {
      if (newQty > 0) {
        const { data } = await api.put('/users/cart', {
          productId: product._id,
          quantity: newQty,
          selectedColor: selectedColor || null
        });
        dispatch(setCart(data.cart));
      } else {
        const { data } = await api.delete(`/users/cart/${product._id}`, {
          params: { selectedColor: selectedColor || "null" }
        });
        dispatch(setCart(data.cart));
        toast.info("Removed from cart");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return toast.warning("Please enter a comment");
    setSubmitting(true);
    try {
      await api.post(`/comments/${id}`, { comment: commentText });
      toast.success('Comment posted');
      // Refetch comments
      const { data } = await api.get(`/comments/${id}`);
      setComments(data);
      setCommentText('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pd-v2-container">
      {/* Back Button */}
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        <BackIcon size={18} strokeWidth={2.5} />
        Back
      </button>

      <div className="pd-v2-main-grid">
        <div className="pd-v2-visuals">
          <div className="pd-v2-slider-wrapper">
            <Slider {...sliderSettings}>
              {displayImages.map((img, idx) => (
                <div key={idx} className="pd-v2-slide">
                  <img src={img.url} alt="" />
                </div>
              ))}
            </Slider>
          </div>

          {product.showColors && (
            <div className="pd-v2-color-selector">
              <p>Selection: <span style={{ color: '#38bdf8' }}>{selectedColorObj?.name || "Selected Color"}</span></p>
              <div className="pd-v2-colors-list">
                {product.colors.map((c, idx) => (
                  <button
                    key={idx}
                    className={`pd-v2-color-btn ${selectedColorIndex === idx ? 'active' : ''}`}
                    style={{ backgroundColor: c.code }}
                    onClick={() => setSelectedColorIndex(idx)}
                    title={c.name || ""}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pd-v2-info">
          <div className="pd-v2-header">
            <h1 className="pd-v2-title">{product.name}</h1>
            <div className="pd-v2-header-actions">
              <button
                className={`pd-v2-icon-btn fav ${isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
              >
                <HeartIcon size={22} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button className="pd-v2-icon-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.info("Link copied!");
              }}>
                <ShareIcon size={22} />
              </button>
            </div>
          </div>

          <div className="pd-v2-pricing-row">
            <div className="pd-v2-price-group">
              <span className="current">${product.price}</span>
              {product.discount > 0 && (
                <>
                  <span className="original">${originalPrice}</span>
                  <span className="discount">-{product.discount}% OFF</span>
                </>
              )}
            </div>

            <div className="pd-v2-cart-actions">
              {cartItem ? (
                <div className="pd-v2-qty-counter">
                  <button onClick={() => handleUpdateQty(cartItem.quantity - 1)}>-</button>
                  <span>{cartItem.quantity}</span>
                  <button onClick={() => handleUpdateQty(cartItem.quantity + 1)}>+</button>
                </div>
              ) : (
                <button
                  className="pd-v2-add-btn"
                  onClick={handleAddToCart}
                  disabled={product.showColors ? (product.colors[selectedColorIndex]?.countInStock === 0) : (product.countInStock === 0)}
                >
                  {(product.showColors ? (product.colors[selectedColorIndex]?.countInStock === 0) : (product.countInStock === 0)) ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>

          <div className="pd-v2-description">
            <label>Description</label>
            <p dangerouslySetInnerHTML={{ __html: product.description }}></p>
          </div>

          <div className="pd-v2-specs">
            <label>Product Details</label>
            <div className="pd-v2-specs-grid">
              {product.type && <div className="spec-item"><span>Type</span><strong>{product.type}</strong></div>}
              {product.brand && <div className="spec-item"><span>Brand</span><strong>{product.brand}</strong></div>}
              {product.category?.name && <div className="spec-item"><span>Category</span><strong>{product.category?.name}</strong></div>}
              {product.material && <div className="spec-item"><span>Material</span><strong>{product.material}</strong></div>}
              {product.packageIncludes && <div className="spec-item"><span>Package Includes</span><strong>{product.packageIncludes}</strong></div>}
              {selectedColor && <div className="spec-item"><span>Color</span><strong>{selectedColor}</strong></div>}
              {product.dimensions?.height && <div className="spec-item"><span>Height</span><strong>{product.dimensions.height}</strong></div>}
              {product.dimensions?.width && <div className="spec-item"><span>Width</span><strong>{product.dimensions.width}</strong></div>}
              {product.dimensions?.length && <div className="spec-item"><span>Length</span><strong>{product.dimensions.length}</strong></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="pd-v2-reviews">
        <h2>Comments</h2>
        <div className="pd-v2-reviews-layout">
          <div className="pd-v2-review-form">
            <h3>Leave a comment</h3>
            {userInfo ? (
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What do you think about this product?"
                  required
                ></textarea>
                <button type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post Comment'}</button>
              </form>
            ) : <p className="pd-login-msg">Please <Link to="/">Log in</Link> to join the discussion.</p>}
          </div>

          <div className="pd-v2-reviews-list">
            {comments.length === 0 ? <p className="pd-v2-empty">No comments yet. Share your thoughts!</p> : comments.map((c) => (
              <div key={c._id} className="pd-v2-comment-item">
                <div className="pd-v2-comment-avatar">
                  {(c.user?.username || c.username || 'U')[0].toUpperCase()}
                </div>
                <div className="pd-v2-comment-content">
                  <div className="pd-v2-comment-header">
                    <strong>{c.user?.username || c.username}</strong>
                    <span className="pd-v2-comment-time">
                      {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="pd-v2-comment-text">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
