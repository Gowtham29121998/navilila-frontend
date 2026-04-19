import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import AddProductModal from './AddProductModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../assets/images/icons';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? All images will be permanently removed.')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed delete');
      }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="admin-products-container">
      <div className="admin-header-row">
        <div className="admin-header-section">
          <h1>Inventory</h1>
          <p>{products.length} products listed</p>
        </div>
        <button className="admin-create-btn" onClick={handleCreate}>
          <PlusIcon />
          <span>New Product</span>
        </button>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-loader">Loading...</div> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th className="hide-mobile">Price</th>
                  <th className="hide-mobile">Stock</th>
                  <th className="hide-mobile">Category</th>
                  <th className="hide-mobile">Brand</th>
                  <th className="hide-mobile">Material</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="product-cell">
                      <img src={product.image || 'https://via.placeholder.com/50'} alt="" className="table-thumb" />
                    </td>
                    <td className="name-cell">
                      <strong>{product.name}</strong>
                      <div className="mobile-only-price">${product.price}</div>
                    </td>
                    <td className="hide-mobile">${product.price}</td>
                    <td className="hide-mobile">{product.countInStock}</td>
                    <td className="hide-mobile">{product.category?.name || 'N/A'}</td>
                    <td className="hide-mobile">{product.brand || '—'}</td>
                    <td className="hide-mobile">{product.material || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns">
                        <button className="edit-btn" onClick={() => handleEdit(product)}>
                          <EditIcon size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
        onRefresh={fetchProducts} 
        editingProduct={selectedProduct}
      />
    </div>
  );
};

export default AdminProducts;
