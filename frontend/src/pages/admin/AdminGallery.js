import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    image: '',
    isPublished: true
  });

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (editImage) {
      setFormData({
        title: editImage.title,
        description: editImage.description,
        category: editImage.category,
        image: editImage.image,
        isPublished: editImage.isPublished
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'food',
        image: '',
        isPublished: true
      });
    }
  }, [editImage]);

  const fetchImages = async () => {
    try {
      const response = await api.get('/gallery');
      setImages(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load gallery');
      setImages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editImage) {
        await api.put(`/gallery/${editImage._id}`, formData);
        toast.success('✓ Image updated!');
      } else {
        await api.post('/gallery', formData);
        toast.success('✓ Image added!');
      }
      setShowModal(false);
      setEditImage(null);
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save image');
    }
  };

  const deleteImage = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await api.delete(`/gallery/${id}`);
        toast.success('✓ Image deleted!');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  const togglePublish = async (image) => {
    try {
      await api.put(`/gallery/${image._id}`, { isPublished: !image.isPublished });
      toast.success(`✓ ${image.isPublished ? 'Unpublished' : 'Published'}!`);
      fetchImages();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100">Gallery Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{images.length} images in gallery</p>
          </div>
          <button onClick={() => { setEditImage(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus /> Upload Image
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img._id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group">
              <div className="relative">
                <img src={img.image} alt={img.title} loading="lazy" className="w-full h-48 object-cover" />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${img.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 dark:bg-gray-600 text-white'}`}>
                  {img.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm mb-1">{img.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{img.description}</p>
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded mb-3">{img.category}</span>
                <div className="flex gap-1">
                  <button onClick={() => togglePublish(img)} className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs">
                    Toggle
                  </button>
                  <button onClick={() => { setEditImage(img); setShowModal(true); }} className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                    <FiEdit2 className="inline" /> Edit
                  </button>
                  <button onClick={() => deleteImage(img._id)} className="flex-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">
                    <FiTrash2 className="inline" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-xl w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{editImage ? 'Edit Image' : 'Upload New Image'}</h2>
                <button onClick={() => { setShowModal(false); setEditImage(null); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="food">Food</option>
                    <option value="interior">Interior</option>
                    <option value="events">Events</option>
                    <option value="team">Team</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" loading="lazy" className="mt-2 w-full h-40 object-cover rounded" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish immediately</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditImage(null); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    {editImage ? 'Update Image' : 'Upload Image'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;

