import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import InfoTooltip from '../../components/InfoTooltip';

const AdminSEO = () => {
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: []
  });

  const fetchSEOData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seo/${page}`);
      if (response.data) {
        setSeoData({
          title: response.data.title || '',
          description: response.data.description || '',
          keywords: response.data.keywords || []
        });
      }
    } catch (error) {
      console.error('Failed to load SEO data:', error);
      // Reset to empty if not found
      setSeoData({
        title: '',
        description: '',
        keywords: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSave = async () => {
    try {
      await api.put(`/seo/${page}`, seoData);
      toast.success('✓ SEO settings updated!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to update SEO settings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100">SEO Management</h1>
            <InfoTooltip 
              title="What is SEO?"
              content="SEO (Search Engine Optimization) helps your website rank higher on Google and other search engines. Better SEO means more people will find your café when searching online."
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Optimize your website for search engines to attract more customers</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Page</label>
              <InfoTooltip content="Choose which page you want to optimize. Each page needs its own SEO settings for best results." />
            </div>
            <select value={page} onChange={(e) => setPage(e.target.value)} className="input-field">
              <option value="home">Home Page</option>
              <option value="menu">Menu Page</option>
              <option value="about">About Page</option>
              <option value="gallery">Gallery Page</option>
              <option value="contact">Contact Page</option>
              <option value="reservations">Reservations Page</option>
            </select>
          </div>
          
          <div className="space-y-6">
            <div className="border-b dark:border-gray-700 pb-6">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Page Title</label>
                <InfoTooltip 
                  title="Page Title"
                  content="This appears in Google search results and browser tabs. Keep it under 60 characters. Example: 'Lumière Café - Best Coffee in Downtown Mumbai'"
                />
              </div>
              <input
                type="text"
                value={seoData.title}
                onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                maxLength={60}
                className="input-field"
                placeholder="Lumière Café - Best Coffee & Dining Experience"
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {seoData.title.length}/60 characters
              </div>
            </div>
            
            <div className="border-b dark:border-gray-700 pb-6">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                <InfoTooltip 
                  title="Meta Description"
                  content="This text appears below your title in Google search results. Describe what makes your café special. Keep it under 160 characters to avoid truncation."
                />
              </div>
              <textarea
                value={seoData.description}
                onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                maxLength={160}
                className="input-field"
                rows="3"
                placeholder="Experience fine dining at Lumière Café. Fresh ingredients, cozy ambiance, and exceptional service in the heart of the city."
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {seoData.description.length}/160 characters
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 SEO Best Practices</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Include your café name and key offerings in the title</li>
                <li>• Mention your location to attract local customers</li>
                <li>• Use action words like "Discover", "Experience", "Taste"</li>
                <li>• Make each page's description unique</li>
                <li>• Update SEO regularly based on menu changes</li>
              </ul>
            </div>

            <button onClick={handleSave} className="btn-primary w-full">
              Save SEO Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;

