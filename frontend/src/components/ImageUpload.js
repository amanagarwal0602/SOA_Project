import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({ value, onChange, label = "Image", preview = true, className = "" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onChange(reader.result); // Send base64 or you can upload to server
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleURLChange = (e) => {
    const url = e.target.value;
    setImagePreview(url);
    onChange(url);
  };

  const removeImage = () => {
    setImagePreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label} (Optional)</label>
      
      {/* Image Preview */}
      {preview && imagePreview && (
        <div className="relative mb-4 w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Drag and Drop Area */}
      {!imagePreview && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          
          <div className="flex flex-col items-center gap-3">
            <FiImage size={48} className="text-gray-400" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                Drag and drop your image here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                or
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 mx-auto"
              >
                <FiUpload /> Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="mt-3">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Or paste image URL
        </label>
        <input
          type="url"
          value={imagePreview}
          onChange={handleURLChange}
          placeholder="https://example.com/image.jpg"
          className="input-field text-sm"
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        If no image is provided, an avatar with initials will be displayed
      </p>
    </div>
  );
};

export default ImageUpload;
