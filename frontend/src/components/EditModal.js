import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

/**
 * Universal Edit Modal for different content types
 */
const EditModal = ({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  onSave 
}) => {
  const [formData, setFormData] = useState(data || {});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      
      switch (type) {
        case 'menu-item':
          response = await api.put(`/menu/${formData._id}`, formData);
          break;
        case 'hero':
          response = await api.put('/hero', formData);
          break;
        case 'feature':
          response = await api.put(`/features/${formData._id}`, formData);
          break;
        case 'team-member':
          response = await api.put(`/team/${formData._id}`, formData);
          break;
        case 'gallery-item':
          response = await api.put(`/gallery/${formData._id}`, formData);
          break;
        case 'about':
          response = await api.put('/about', formData);
          break;
        case 'about-story':
          response = await api.put('/about', formData);
          break;
        case 'todays-offer':
          response = await api.put(`/todays-offers/${formData._id}`, formData);
          break;
        case 'logo':
          response = await api.put('/site-settings', formData);
          break;
        case 'nav-link':
          response = await api.put('/navigation', formData);
          break;
        case 'contact-info':
          response = await api.put('/contact-info', formData);
          break;
        case 'opening-hours':
          response = await api.put('/contact-info', { openingHours: formData });
          break;
        case 'footer-about':
          response = await api.put('/about', formData);
          break;
        case 'social-links':
          response = await api.put('/social-links', formData);
          break;
        case 'review':
          response = await api.put(`/reviews/${formData._id}`, formData);
          break;
        case 'edit-banner':
          // This is just UI text, no backend save needed
          toast.success('✓ Banner text updated!', { autoClose: 2000 });
          setTimeout(() => {
            onSave({ text: formData.text, subtitle: formData.subtitle });
            onClose();
          }, 1000);
          setLoading(false);
          return;
        default:
          throw new Error('Unknown content type');
      }
      
      toast.success('✓ Updated successfully!', { autoClose: 2000 });
      setTimeout(() => {
        onSave(response.data);
        onClose();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'menu-item':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder={data?.name || 'Enter item name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder={data?.description || 'Enter item description'}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input-field"
                  placeholder={data?.price || '0'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                  placeholder={data?.category || 'Enter category'}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="input-field"
                placeholder={data?.image || 'Enter image URL'}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable || false}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Available for order</label>
            </div>
          </>
        );

      case 'hero':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder={data?.title || 'Enter title'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle *</label>
              <textarea
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="input-field"
                rows="2"
                placeholder={data?.subtitle || 'Enter subtitle'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image URL</label>
              <input
                type="url"
                value={formData.backgroundImage || ''}
                onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})}
                className="input-field"
                placeholder={data?.backgroundImage || 'Enter background image URL'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={formData.buttonText || ''}
                onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                className="input-field"
                placeholder={data?.buttonText || 'Enter button text'}
              />
            </div>
          </>
        );

      case 'feature':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder={data?.title || 'Enter feature title'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder={data?.description || 'Enter feature description'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="input-field"
                placeholder={data?.icon || '☕'}
              />
            </div>
          </>
        );

      case 'team-member':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder={data?.name || 'Enter name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="input-field"
                placeholder={data?.role || 'Enter role'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="input-field"
                rows="3"
                placeholder={data?.bio || 'Enter bio'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="input-field"
                placeholder={data?.image || 'Enter image URL'}
              />
            </div>
          </>
        );

      case 'todays-offer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder={data?.title || 'Enter offer title'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder={data?.description || 'Enter offer description'}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount *</label>
                <input
                  type="text"
                  value={formData.discount || ''}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  className="input-field"
                  placeholder={data?.discount || '20% OFF'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until *</label>
                <input
                  type="date"
                  value={formData.validUntil?.split('T')[0] || data?.validUntil?.split('T')[0] || ''}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="input-field"
                  required
                />
                {data?.validUntil && !formData.validUntil && (
                  <p className="text-xs text-gray-500 mt-1">Current: {new Date(data.validUntil).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="input-field"
                placeholder={data?.image || 'Enter image URL'}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </>
        );

      case 'about':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder={data?.title || 'Enter title'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="input-field"
                rows="5"
                placeholder={data?.content || 'Enter content'}
                required
              />
            </div>
          </>
        );

      case 'logo':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Site Name *</label>
              <input
                type="text"
                value={formData.siteName || ''}
                onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                className="input-field"
                placeholder={data?.siteName || 'Enter site name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="url"
                value={formData.logo || ''}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                className="input-field"
                placeholder={data?.logo || 'Enter logo URL'}
              />
            </div>
          </>
        );

      case 'contact-info':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Street Address *</label>
              <input
                type="text"
                value={formData.addressStreet || ''}
                onChange={(e) => setFormData({...formData, addressStreet: e.target.value})}
                className="input-field"
                placeholder={data?.addressStreet || 'Enter street address'}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.addressCity || ''}
                  onChange={(e) => setFormData({...formData, addressCity: e.target.value})}
                  className="input-field"
                  placeholder={data?.addressCity || 'City'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <input
                  type="text"
                  value={formData.addressState || ''}
                  onChange={(e) => setFormData({...formData, addressState: e.target.value})}
                  className="input-field"
                  placeholder={data?.addressState || 'State'}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zipcode *</label>
              <input
                type="text"
                value={formData.addressZipcode || ''}
                onChange={(e) => setFormData({...formData, addressZipcode: e.target.value})}
                className="input-field"
                placeholder={data?.addressZipcode || 'Zipcode'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field"
                placeholder={data?.phone || '(555) 123-4567'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder={data?.email || 'email@example.com'}
                required
              />
            </div>
          </>
        );

      case 'footer-about':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder={data?.title || 'Enter title'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="4"
                placeholder={data?.description || 'Enter description'}
                required
              />
            </div>
          </>
        );

      case 'logo':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Site Name *</label>
              <input
                type="text"
                value={formData.siteName || ''}
                onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                className="input-field"
                placeholder={data?.siteName || 'Enter site name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="url"
                value={formData.logo || ''}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                className="input-field"
                placeholder={data?.logo || 'Enter logo URL'}
              />
            </div>
          </>
        );

      case 'contact-info':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Street Address *</label>
              <input
                type="text"
                value={formData.addressStreet || ''}
                onChange={(e) => setFormData({...formData, addressStreet: e.target.value})}
                className="input-field"
                placeholder={data?.addressStreet || 'Enter street address'}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.addressCity || ''}
                  onChange={(e) => setFormData({...formData, addressCity: e.target.value})}
                  className="input-field"
                  placeholder={data?.addressCity || 'City'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <input
                  type="text"
                  value={formData.addressState || ''}
                  onChange={(e) => setFormData({...formData, addressState: e.target.value})}
                  className="input-field"
                  placeholder={data?.addressState || 'State'}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zipcode *</label>
              <input
                type="text"
                value={formData.addressZipcode || ''}
                onChange={(e) => setFormData({...formData, addressZipcode: e.target.value})}
                className="input-field"
                placeholder={data?.addressZipcode || 'Zipcode'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field"
                placeholder={data?.phone || '(555) 123-4567'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder={data?.email || 'email@example.com'}
                required
              />
            </div>
          </>
        );

      case 'about-story':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Heading *</label>
              <input
                type="text"
                value={formData.heading || ''}
                onChange={(e) => setFormData({...formData, heading: e.target.value})}
                className="input-field"
                placeholder={data?.heading || 'Our Story'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="input-field"
                rows="8"
                placeholder={data?.content || 'Enter your story content. Use \\n for new paragraphs.'}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Tip: Use \n to create new paragraphs</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="input-field"
                placeholder={data?.image || 'Enter image URL'}
              />
            </div>
          </>
        );

      case 'opening-hours':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Monday</label>
              <input
                type="text"
                value={formData.monday || ''}
                onChange={(e) => setFormData({...formData, monday: e.target.value})}
                className="input-field"
                placeholder={data?.monday || '7:00 AM - 10:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tuesday</label>
              <input
                type="text"
                value={formData.tuesday || ''}
                onChange={(e) => setFormData({...formData, tuesday: e.target.value})}
                className="input-field"
                placeholder={data?.tuesday || '7:00 AM - 10:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Wednesday</label>
              <input
                type="text"
                value={formData.wednesday || ''}
                onChange={(e) => setFormData({...formData, wednesday: e.target.value})}
                className="input-field"
                placeholder={data?.wednesday || '7:00 AM - 10:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Thursday</label>
              <input
                type="text"
                value={formData.thursday || ''}
                onChange={(e) => setFormData({...formData, thursday: e.target.value})}
                className="input-field"
                placeholder={data?.thursday || '7:00 AM - 10:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Friday</label>
              <input
                type="text"
                value={formData.friday || ''}
                onChange={(e) => setFormData({...formData, friday: e.target.value})}
                className="input-field"
                placeholder={data?.friday || '7:00 AM - 11:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Saturday</label>
              <input
                type="text"
                value={formData.saturday || ''}
                onChange={(e) => setFormData({...formData, saturday: e.target.value})}
                className="input-field"
                placeholder={data?.saturday || '7:00 AM - 11:00 PM'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sunday</label>
              <input
                type="text"
                value={formData.sunday || ''}
                onChange={(e) => setFormData({...formData, sunday: e.target.value})}
                className="input-field"
                placeholder={data?.sunday || '8:00 AM - 9:00 PM'}
              />
            </div>
          </>
        );

      case 'edit-banner':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Banner Text *</label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                className="input-field"
                placeholder={data?.text || 'EDIT MODE ACTIVE'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle *</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="input-field"
                placeholder={data?.subtitle || 'Click on any element to edit it'}
                required
              />
            </div>
          </>
        );

      case 'review':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                className="input-field"
                placeholder={data?.userName || 'Enter customer name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <select
                value={formData.rating || 5}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="input-field"
                required
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review Comment *</label>
              <textarea
                value={formData.comment || formData.review || ''}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="input-field"
                rows="4"
                placeholder={data?.comment || data?.review || 'Enter review comment'}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.status === 'approved'}
                onChange={(e) => setFormData({...formData, status: e.target.checked ? 'approved' : 'pending'})}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Approved for display</label>
            </div>
          </>
        );

      case 'review':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                className="input-field"
                placeholder={data?.userName || 'Enter customer name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <select
                value={formData.rating || 5}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="input-field"
                required
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review Comment *</label>
              <textarea
                value={formData.comment || formData.review || ''}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="input-field"
                rows="4"
                placeholder={data?.comment || data?.review || 'Enter review comment'}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.status === 'approved'}
                onChange={(e) => setFormData({...formData, status: e.target.checked ? 'approved' : 'pending'})}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Approved for display</label>
            </div>
          </>
        );

      default:
        return <p>Unknown content type</p>;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'menu-item': return 'Edit Menu Item';
      case 'hero': return 'Edit Hero Section';
      case 'feature': return 'Edit Feature';
      case 'team-member': return 'Edit Team Member';
      case 'gallery-item': return 'Edit Gallery Item';
      case 'about': return 'Edit About Section';
      case 'about-story': return 'Edit Our Story Section';
      case 'todays-offer': return "Edit Today's Offer";
      case 'logo': return 'Edit Logo & Site Name';
      case 'nav-link': return 'Edit Navigation Link';
      case 'contact-info': return 'Edit Contact Information';
      case 'opening-hours': return 'Edit Opening Hours';
      case 'footer-about': return 'Edit Footer About';
      case 'social-links': return 'Edit Social Links';
      case 'edit-banner': return 'Edit Banner Text';
      case 'review': return 'Edit Customer Review';
      default: return 'Edit Content';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {renderFields()}
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
