import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { PlusIcon, UploadIcon, CloseIcon } from '../../../assets/images/icons.jsx';
import './AddProductModal.css';

// Helper to Compress/Resize Image before upload
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        }, 'image/jpeg', quality);
      };
    };
  });
};

// Sub-component for Drag & Drop Upload
const ImageUploadDropzone = ({ onUpload, label, multiple = true }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setIsUploading(true);
    toast.info("Compressing & Uploading...");
    
    try {
      if (multiple && acceptedFiles.length > 1) {
        // Use bulk upload for multiple files
        const formData = new FormData();
        for (const file of acceptedFiles) {
          const compressed = await compressImage(file);
          formData.append('images', compressed);
        }
        const { data } = await api.post('products/upload-multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onUpload(data);
      } else {
        // Single file or sequential upload fallback
        const results = [];
        for (const file of acceptedFiles) {
          const compressedFile = await compressImage(file);
          const formData = new FormData();
          formData.append('image', compressedFile);
          const { data } = await api.post('products/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          results.push({ url: data.url, public_id: data.public_id });
        }
        onUpload(results);
      }
      toast.success("Images ready");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, multiple]);

   const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    multiple
  });

  return (
    <div {...getRootProps()} className={`apm-dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="apm-upload-loader">
          <div className="apm-spinner"></div>
          <p>Processing...</p>
        </div>
      ) : (
        <div className="apm-dropzone-content">
          <UploadIcon size={24} />
          <p>{label || "Upload images"}</p>
        </div>
      )}
    </div>
  );
};

const AddProductModal = ({ isOpen, onClose, onRefresh, editingProduct = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [showColors, setShowColors] = useState(false);
  const [colors, setColors] = useState([{ name: '', code: '#000000', countInStock: '', images: [] }]);
  const [generalImages, setGeneralImages] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [material, setMaterial] = useState('');
  const [packageIncludes, setPackageIncludes] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategoriesList(data);
      } catch (err) { }
    };
    if (isOpen) fetchCats();
  }, [isOpen]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setShowColors(editingProduct.showColors || false);
      setColors(editingProduct.colors?.length > 0 ? editingProduct.colors : [{ name: '', code: '#000000', countInStock: '', images: [] }]);
      setGeneralImages(editingProduct.images || []);
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price || '');
      setDiscount(editingProduct.discount || '');
      setCategory(editingProduct.category?._id || editingProduct.category || '');
      setType(editingProduct.type || '');
      setBrand(editingProduct.brand || '');
      setWidth(editingProduct.dimensions?.width || '');
      setHeight(editingProduct.dimensions?.height || '');
      setLength(editingProduct.dimensions?.length || '');
      setCountInStock(editingProduct.countInStock || '');
      setMaterial(editingProduct.material || '');
      setPackageIncludes(editingProduct.packageIncludes || '');
    } else {
      resetForm();
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name, price: Number(price), description, showColors,
        colors: showColors ? colors.map(c => ({
          name: c.name,
          code: c.code,
          countInStock: Number(c.countInStock) || 0,
          images: c.images.map(img => ({ url: img.url, public_id: img.public_id }))
        })) : [],
        images: !showColors ? generalImages.map(img => ({ url: img.url, public_id: img.public_id })) : [],
        category, type, brand, discount: Number(discount) || 0,
        dimensions: { width, height, length },
        countInStock: showColors ? colors.reduce((acc, c) => acc + (Number(c.countInStock) || 0), 0) : Number(countInStock),
        material,
        packageIncludes,
        image: showColors ? (colors[0]?.images[0]?.url || editingProduct?.image) : generalImages[0]?.url
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Updated!");
      } else {
        await api.post('products', payload);
        toast.success("Created!");
      }
      onRefresh(); onClose(); resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1); setName(''); setShowColors(false); setColors([{ name: '', code: '#000000', countInStock: '', images: [] }]);
    setGeneralImages([]); setDescription(''); setPrice(''); setDiscount('');
    setCategory(''); setType(''); setBrand(''); setWidth(''); setHeight(''); setLength('');
    setCountInStock(''); setMaterial(''); setPackageIncludes('');
  };

  if (!isOpen) return null;

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-container" onClick={(e) => e.stopPropagation()}>
        <div className="apm-header">
          <h2>{editingProduct ? "Edit" : "New"} Product</h2>
          <div className="apm-step-indicator">Step {step}/2</div>
        </div>

        <div className="apm-body">
          {step === 1 ? (
            <div className="apm-step-content">
              <div className="apm-form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="apm-form-checkbox-group apm-big-checkbox">
                <input type="checkbox" id="showColors" checked={showColors} onChange={(e) => setShowColors(e.target.checked)} />
                <label htmlFor="showColors">Show Colors</label>
              </div>

              {showColors ? (
                <div className="apm-colors-section">
                  {colors.map((color, index) => (
                    <div key={index} className="apm-color-item-row">
                      <div className="apm-color-meta-inputs">
                        <input 
                          type="text" 
                          placeholder="Color Name (e.g. Red)" 
                          value={color.name || ''} 
                          onChange={(e) => {
                            const updated = [...colors]; updated[index].name = e.target.value; setColors(updated);
                          }}
                        />
                        <input 
                          type="number" 
                          placeholder="Stock" 
                          value={color.countInStock || ''} 
                          onChange={(e) => {
                            const updated = [...colors]; updated[index].countInStock = e.target.value; setColors(updated);
                          }}
                        />
                      </div>
                      <div className="apm-color-picker-group">
                        <div className="apm-color-picker-wrapper">
                          <input type="color" value={color.code} onChange={(e) => {
                            const updated = [...colors]; updated[index].code = e.target.value; setColors(updated);
                          }} />
                        </div>
                        <ImageUploadDropzone 
                          onUpload={(results) => {
                            const updated = [...colors]; updated[index].images = [...updated[index].images, ...results]; setColors(updated);
                          }} 
                          label="Upload Images" 
                          multiple={!editingProduct}
                        />
                      </div>
                      
                      <div className="apm-preview-images">
                        {color.images?.map((img, i) => (
                          <div key={i} className="apm-preview-img-wrapper">
                            <img src={img.url} alt="" />
                            <button onClick={() => {
                              const updated = [...colors]; updated[index].images = updated[index].images.filter((_, idx) => idx !== i); setColors(updated);
                            }}>
                                <CloseIcon size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="apm-add-color-btn" onClick={() => setColors([...colors, { name: '', code: '#000000', countInStock: '', images: [] }])}>
                      <PlusIcon size={14} /> Add Color
                  </button>
                </div>
              ) : (
                <div className="apm-form-group">
                  <ImageUploadDropzone 
                    onUpload={(res) => setGeneralImages([...generalImages, ...res])} 
                    multiple={!editingProduct}
                  />
                  <div className="apm-preview-images">
                    {generalImages?.map((img, i) => (
                      <div key={i} className="apm-preview-img-wrapper">
                        <img src={img.url} alt="" />
                        <button onClick={() => setGeneralImages(generalImages.filter((_, idx) => idx !== i))}>
                             <CloseIcon size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="apm-form-group">
                <label>Description</label>
                <textarea 
                  className="apm-textarea"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the product..."
                />
              </div>

              <div className="apm-form-row">
                <div className="apm-form-group"><label>Price ($)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                <div className="apm-form-group"><label>Discount (%)</label><input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
              </div>
            </div>
          ) : (
            <div className="apm-step-content">
              <div className="apm-form-group">
                <label>Category</label>
                <select className="apm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  {categoriesList.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="apm-form-row">
                <div className="apm-form-group"><label>Type</label><input type="text" value={type} onChange={(e) => setType(e.target.value)} /></div>
                <div className="apm-form-group"><label>Brand</label><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
              </div>
              <div className="apm-form-row">
                <div className="apm-form-group"><label>Material</label><input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} /></div>
                <div className="apm-form-group"><label>Package Includes</label><input type="text" value={packageIncludes} onChange={(e) => setPackageIncludes(e.target.value)} /></div>
              </div>
              <div className="apm-form-row">
                <div className="apm-form-group"><label>H</label><input type="text" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
                <div className="apm-form-group"><label>W</label><input type="text" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
                <div className="apm-form-group"><label>L</label><input type="text" value={length} onChange={(e) => setLength(e.target.value)} /></div>
              </div>
              <div className="apm-form-group">
                <label>Stock {showColors && "(Auto-calculated from colors)"}</label>
                <input 
                  type="number" 
                  value={showColors ? colors.reduce((acc, c) => acc + (Number(c.countInStock) || 0), 0) : countInStock} 
                  onChange={(e) => setCountInStock(e.target.value)} 
                  disabled={showColors}
                  style={showColors ? { background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>
          )}
        </div>

        <div className="apm-footer">
          <button className="apm-cancel-btn" onClick={onClose}>Cancel</button>
          <div>
            {step === 2 && <button className="apm-prev-btn" onClick={() => setStep(1)}>Back</button>}
            <button className="apm-next-btn" onClick={step === 1 ? () => setStep(2) : handleSubmit} disabled={loading}>
              {loading ? "..." : step === 1 ? "Next" : (editingProduct ? "Update" : "Create")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
