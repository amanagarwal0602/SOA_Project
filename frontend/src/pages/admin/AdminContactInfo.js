import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminContactInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    mapEmbedUrl: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data } = await api.get('/contact-info');
      setFormData({
        businessName: data.businessName || 'Lumiere Cafe',
        tagline: data.tagline || '',
        email: data.email || data.addressEmail || '',
        phone: data.phone || '',
        address: {
          street: data.addressStreet || data.address?.street || '',
          city: data.addressCity || data.address?.city || '',
          state: data.addressState || data.address?.state || '',
          zipCode: data.addressZipcode || data.address?.zipCode || '',
          country: data.addressCountry || data.address?.country || ''
        },
        hours: data.openingHours || data.hours || {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        socialMedia: {
          facebook: data.socialFacebook || data.socialMedia?.facebook || '',
          instagram: data.socialInstagram || data.socialMedia?.instagram || '',
          twitter: data.socialTwitter || data.socialMedia?.twitter || '',
          linkedin: data.socialLinkedin || data.socialMedia?.linkedin || '',
          youtube: data.socialMedia?.youtube || ''
        },
        mapEmbedUrl: data.mapEmbedUrl || ''
      });
    } catch (error) {
      console.error('Contact info error:', error);
      toast.error('Failed to load contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        businessName: formData.businessName,
        tagline: formData.tagline,
        email: formData.email,
        phone: formData.phone,
        addressStreet: formData.address.street,
        addressCity: formData.address.city,
        addressState: formData.address.state,
        addressZipcode: formData.address.zipCode,
        addressCountry: formData.address.country,
        openingHours: formData.hours,
        socialFacebook: formData.socialMedia.facebook,
        socialInstagram: formData.socialMedia.instagram,
        socialTwitter: formData.socialMedia.twitter,
        socialLinkedin: formData.socialMedia.linkedin,
        mapEmbedUrl: formData.mapEmbedUrl
      };
      await api.put('/contact-info', payload);
      toast.success('✓ Contact information updated!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Contact Information</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all contact details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Address</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street</label>
            <input
              type="text"
              name="street"
              value={formData.address.street}
              onChange={(e) => handleChange(e, 'address')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={(e) => handleChange(e, 'address')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={(e) => handleChange(e, 'address')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PIN Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => handleChange(e, 'address')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.address.country}
              onChange={(e) => handleChange(e, 'address')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Business Hours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{day}</label>
                <input
                  type="text"
                  name={day}
                  value={formData.hours[day]}
                  onChange={(e) => handleChange(e, 'hours')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="9:00 AM - 5:00 PM"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Social Media</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map(platform => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{platform}</label>
                <input
                  type="url"
                  name={platform}
                  value={formData.socialMedia[platform]}
                  onChange={(e) => handleChange(e, 'socialMedia')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={`https://${platform}.com/yourpage`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Map Embed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Google Maps Embed</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Map Embed URL
              <span className="text-xs text-gray-500 ml-2">(From Google Maps Share → Embed)</span>
            </label>
            <input
              type="url"
              name="mapEmbedUrl"
              value={formData.mapEmbedUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="https://www.google.com/maps/embed?pb=..."
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

export default AdminContactInfo;

