import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get('/gallery');
      setImages(response.data.data || []);
    } catch (error) {
      console.error('Failed to load gallery');
      setImages([]);
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchImages(); // Refresh images after edit
  };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="bg-brown-500 dark:bg-gray-800 text-white dark:text-gray-200 py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Gallery</h1>
          <p className="text-xl">Moments captured at Lumière</p>
        </div>
      </div>
      
      <div className="container-custom py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl font-serif font-bold mb-4 text-gray-800 dark:text-gray-200">No Images Yet</div>
            <p className="text-gray-600 dark:text-gray-400">Gallery is empty. Add photos through admin panel.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <EditableWrapper 
              key={image._id}
              onEdit={() => handleEdit('gallery-item', image)} 
              type="gallery-item"
            >
            <div
              onClick={() => setSelectedImage(image)}
              className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition"
            >
              <img
                src={image.image || 'https://via.placeholder.com/400'}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </div>
            </EditableWrapper>
          ))}
        </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.image}
            alt={selectedImage.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </div>
  );
};

export default GalleryPage;


