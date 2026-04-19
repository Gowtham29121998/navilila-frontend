import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './AddCategoryModal.css';

const AddCategoryModal = ({ isOpen, onClose, onRefresh, editingCategory = null }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setImage(editingCategory.image);
    } else {
      setName('');
      setImage(null);
    }
  }, [editingCategory, isOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Reuse the same product upload endpoint for convenience
      const { data } = await api.post('products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImage({ url: data.url, public_id: data.public_id });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !image) {
      return toast.error("Please provide both name and image");
    }

    setLoading(true);
    try {
      const payload = { name, image };
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post('/categories', payload);
        toast.success("Category created");
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="acm-overlay" onClick={onClose}>
      <div className="acm-container" onClick={(e) => e.stopPropagation()}>
        <div className="acm-header">
          <h2>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
          <button className="acm-close-x" onClick={onClose}>&times;</button>
        </div>
        <div className="acm-body">
          <div className="acm-form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Electronics, Fashion, etc." 
            />
          </div>
          <div className="acm-form-group">
            <label>Category Image</label>
            <div className="acm-upload-box">
              {image ? (
                <div className="acm-image-preview">
                  <img src={image.url} alt="category" />
                  <button className="acm-remove-btn" onClick={() => setImage(null)}>&times;</button>
                </div>
              ) : (
                <label className="acm-upload-label">
                  {uploading ? "Uploading..." : "Click to upload image"}
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="acm-footer">
          <button className="acm-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="acm-save-btn" onClick={handleSubmit} disabled={loading || uploading}>
            {loading ? "Saving..." : (editingCategory ? "Update Category" : "Create Category")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
