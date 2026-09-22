import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InfoTooltip from '../../components/InfoTooltip';
import { toast } from 'react-toastify';

const AdminHero = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    isActive: true
  });

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const { data } = await api.get('/hero');
      // Map the data to formData structure
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        backgroundImage: data.backgroundImage || '',
        primaryButtonText: data.primaryButtonText || '',
        primaryButtonLink: data.primaryButtonLink || '',
        secondaryButtonText: data.secondaryButtonText || '',
        secondaryButtonLink: data.secondaryButtonLink || '',
        isActive: data.isActive !== false
      });
    } catch (error) {
      console.error('Fetch hero error:', error);
      toast.error('Failed to load hero section');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/hero', formData);
      toast.success('✓ Hero section updated!');
    } catch (error) {
      console.error('Update hero error:', error);
      toast.error(error.response?.data?.message || 'Failed to update hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Hero Section</h1>
          <InfoTooltip 
            title="Hero Section"
            content="This is the first thing visitors see on your homepage - the large banner at the top. Make it eye-catching with a great image and compelling text to welcome customers."
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage the main banner on your homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Main Title
            </label>
            <InfoTooltip content="The big headline visitors see first. Make it catchy! Example: 'Welcome to Lumière Café' or 'Where Coffee Meets Elegance'" />
          </div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subtitle
            </label>
            <InfoTooltip content="A supporting line below the main title. Keep it short and descriptive. Example: 'Your Daily Dose of Happiness'" />
          </div>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <InfoTooltip content="Additional text to explain what makes your café special. This appears in smaller text below the subtitle." />
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Background Image URL
            </label>
            <InfoTooltip 
              title="Background Image"
              content="The large photo behind your text. Use a high-quality image of your café, coffee, or food. Free images: unsplash.com, pexels.com. Copy the image URL and paste it here."
            />
          </div>
          <input
            type="url"
            name="backgroundImage"
            value={formData.backgroundImage}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="https://images.unsplash.com/..."
          />
          {formData.backgroundImage && (
            <img 
              src={formData.backgroundImage} 
              alt="Preview" 
              loading="lazy"
              className="mt-3 w-full h-48 object-cover rounded-lg"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Button Text
              </label>
              <InfoTooltip content="Text for the main call-to-action button. Example: 'View Menu', 'Order Now', 'Book Table'" />
            </div>
            <input
              type="text"
              name="primaryButtonText"
              value={formData.primaryButtonText}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Button Link
              </label>
              <InfoTooltip content="Where the button takes users. Use /menu, /reservations, /about, or any page on your site." />
            </div>
            <input
              type="text"
              name="primaryButtonLink"
              value={formData.primaryButtonLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="/menu"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Secondary Button Text
              </label>
              <InfoTooltip content="Text for the second button (optional). Example: 'Learn More', 'Contact Us'" />
            </div>
            <input
              type="text"
              name="secondaryButtonText"
              value={formData.secondaryButtonText}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Secondary Button Link
              </label>
              <InfoTooltip content="Where the secondary button takes users. Leave empty if not using a second button." />
            </div>
            <input
              type="text"
              name="secondaryButtonLink"
              value={formData.secondaryButtonLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="/reservations"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Active (Show hero section on homepage)
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHero;

