import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import AddCategoryModal from './AddCategoryModal';
import { PlusIcon } from '../../../assets/images/icons.jsx';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load categories");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete category?")) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success("Deleted");
        fetchCategories();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <div className="admin-categories-container">
      <div className="admin-header-row">
        <div className="admin-header-section">
          <h1>Categories</h1>
          <p>{categories.length} groups</p>
        </div>
        <button className="admin-create-btn" onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}>
          <PlusIcon />
          <span>New Category</span>
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <div key={cat._id} className="category-item-card">
                <div className="category-img-box">
                  <img src={cat.image?.url || 'https://via.placeholder.com/150'} alt={cat.name} />
                </div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <div className="category-actions">
                    <button className="cat-edit-btn" onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }}>Edit</button>
                    <button className="cat-delete-btn" onClick={() => handleDelete(cat._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchCategories}
        editingCategory={selectedCategory}
      />
    </div>
  );
};

export default AdminCategories;
