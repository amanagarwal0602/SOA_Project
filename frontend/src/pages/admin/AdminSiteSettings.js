import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import InfoTooltip from '../../components/InfoTooltip';

const AdminSiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    logo: '',
    favicon: '',
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    footerText: '',
    announcementBar: {
      enabled: false,
      message: '',
      backgroundColor: '',
      textColor: ''
    },
    maintenanceMode: {
      enabled: false,
      message: ''
    },
    googleAnalyticsId: '',
    facebookPixelId: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/site-settings');
      setFormData({
        siteName: data.siteName || 'Lumiere Cafe',
        logo: data.logo || '',
        favicon: data.favicon || '',
        primaryColor: data.primaryColor || '#3b82f6',
        secondaryColor: data.secondaryColor || '#8b5cf6',
        accentColor: data.accentColor || '#ec4899',
        footerText: data.footerText || '© 2024 Lumiere Cafe. All rights reserved.',
        announcementBar: data.announcementBar || {
          enabled: false,
          message: '',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        },
        maintenanceMode: data.maintenanceMode || {
          enabled: false,
          message: 'We are currently under maintenance. Please check back soon.'
        },
        googleAnalyticsId: data.googleAnalyticsId || '',
        facebookPixelId: data.facebookPixelId || ''
      });
    } catch (error) {
      console.error('Settings error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/site-settings', formData);
      toast.success('✓ Settings updated! Page will reload...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e, section = null, field = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: val }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Site Settings</h1>
          <InfoTooltip 
            title="Site Settings"
            content="Control the overall look, branding, and functionality of your entire website. These settings apply to every page."
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Configure your website settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Basic Settings</h2>
            <InfoTooltip content="Essential branding elements that identify your café across the website" />
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Name *</label>
              <InfoTooltip content="Your café's name as it appears in browser tabs and throughout the site" />
            </div>
            <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</label>
                <InfoTooltip 
                  title="Logo"
                  content="Your café's logo image that appears in the header. Upload to an image hosting service and paste the URL here."
                />
              </div>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://..."
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Favicon URL</label>
                <InfoTooltip 
                  title="Favicon"
                  content="The small icon that appears in browser tabs. Should be 16x16 or 32x32 pixels. Use a simple version of your logo."
                />
              </div>
              <input
                type="url"
                name="favicon"
                value={formData.favicon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Footer Text</label>
              <InfoTooltip content="Copyright text that appears at the bottom of every page. Example: '© 2024 Lumière Café. All rights reserved.'" />
            </div>
            <input
              type="text"
              name="footerText"
              value={formData.footerText}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Brand Colors</h2>
            <InfoTooltip 
              title="Brand Colors"
              content="Choose colors that match your café's personality. Primary: main buttons & links. Secondary: headings & highlights. Accent: special elements & CTAs."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
                <InfoTooltip content="Main brand color used for buttons, links, and primary elements" />
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-10 w-20 border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-700 p-1"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</label>
                <InfoTooltip content="Supporting color for headings and secondary elements" />
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  className="h-10 w-20 border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-700 p-1"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accent Color</label>
                <InfoTooltip content="Eye-catching color for special offers, important buttons, and call-to-actions" />
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="h-10 w-20 border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-700 p-1"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Announcement Bar</h2>
              <InfoTooltip 
                title="Announcement Bar"
                content="A colorful banner at the top of your website to display important messages like 'Free delivery on orders over ₹500' or 'New seasonal menu available!'"
              />
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.announcementBar.enabled}
                onChange={(e) => handleChange(e, 'announcementBar')}
                className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
            </label>
          </div>

          {formData.announcementBar.enabled && (
            <>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <InfoTooltip content="Your announcement text. Keep it short and attention-grabbing!" />
                </div>
                <input
                  type="text"
                  name="message"
                  value={formData.announcementBar.message}
                  onChange={(e) => handleChange(e, 'announcementBar')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="🎉 Grand Opening Special: 20% off all orders this week!"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</label>
                    <InfoTooltip content="Choose a bright, eye-catching color for the announcement bar background" />
                  </div>
                  <input
                    type="color"
                    name="backgroundColor"
                    value={formData.announcementBar.backgroundColor}
                    onChange={(e) => handleChange(e, 'announcementBar')}
                    className="h-10 w-full border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-700 p-1"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Color</label>
                    <InfoTooltip content="Text color should contrast well with the background for readability" />
                  </div>
                  <input
                    type="color"
                    name="textColor"
                    value={formData.announcementBar.textColor}
                    onChange={(e) => handleChange(e, 'announcementBar')}
                    className="h-10 w-full border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-700 p-1"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Maintenance Mode</h2>
              <InfoTooltip 
                title="Maintenance Mode"
                content="Temporarily disable your website and show a maintenance message. Use this when making major updates or repairs. Only admins can access the site when enabled."
              />
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.maintenanceMode.enabled}
                onChange={(e) => handleChange(e, 'maintenanceMode')}
                className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
            </label>
          </div>

          {formData.maintenanceMode.enabled && (
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <InfoTooltip content="Message visitors will see while the site is under maintenance" />
              </div>
              <textarea
                name="message"
                value={formData.maintenanceMode.message}
                onChange={(e) => handleChange(e, 'maintenanceMode')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="We're making improvements! Check back soon."
              />
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Analytics & Tracking</h2>
            <InfoTooltip 
              title="Analytics"
              content="Track visitor behavior and measure marketing success. Google Analytics shows website traffic. Facebook Pixel tracks ad performance."
            />
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Analytics ID</label>
              <InfoTooltip 
                title="Google Analytics"
                content="Get insights on visitors, page views, and user behavior. Sign up at analytics.google.com. Format: G-XXXXXXXXXX"
              />
            </div>
            <input
              type="text"
              name="googleAnalyticsId"
              value={formData.googleAnalyticsId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Pixel ID</label>
              <InfoTooltip 
                title="Facebook Pixel"
                content="Track conversions from Facebook ads. Find your Pixel ID in Facebook Events Manager. Format: 15-16 digit number"
              />
            </div>
            <input
              type="text"
              name="facebookPixelId"
              value={formData.facebookPixelId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="123456789012345"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettings;

