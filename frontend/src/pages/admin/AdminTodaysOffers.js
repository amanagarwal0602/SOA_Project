import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ImageUpload from '../../components/ImageUpload';
import Avatar from '../../components/Avatar';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCalendar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminTodaysOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    image: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (editOffer) {
      // Convert date to YYYY-MM-DD format for input
      const dateValue = editOffer.validUntil ? editOffer.validUntil.split('T')[0] : '';
      setFormData({
        title: editOffer.title,
        description: editOffer.description,
        discount: editOffer.discount,
        image: editOffer.image,
        validUntil: dateValue,
        isActive: editOffer.isActive
      });
    } else {
      setFormData({
        title: '',
        description: '',
        discount: '',
        image: '',
        validUntil: '',
        isActive: true
      });
    }
  }, [editOffer]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todays-offers/all');
      if (response.data) {
        // Handle both array and object responses
        setOffers(Array.isArray(response.data) ? response.data : (response.data.data || []));
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editOffer) {
        await api.put(`/todays-offers/${editOffer._id || editOffer.id}`, formData);
        toast.success('✓ Offer updated!', { autoClose: 2000 });
      } else {
        await api.post('/todays-offers', formData);
        toast.success('✓ Offer added!', { autoClose: 2000 });
      }
      setShowModal(false);
      setEditOffer(null);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const deleteOffer = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/todays-offers/${id}`);
        toast.success('✓ Offer deleted!', { autoClose: 2000 });
        fetchOffers();
      } catch (error) {
        toast.error('Failed to delete offer');
      }
    }
  };

  const toggleActive = async (offer) => {
    try {
      await api.patch(`/todays-offers/${offer._id || offer.id}/toggle`);
      toast.success('✓ Offer status updated!', { autoClose: 2000 });
      fetchOffers();
    } catch (error) {
      toast.error('Failed to update offer status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100">Today's Offers Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{offers.length} offers configured</p>
          </div>
          <button 
            onClick={() => { setEditOffer(null); setShowModal(true); }} 
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add New Offer
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No offers found</p>
            <p className="text-gray-500">Click "Add New Offer" to create your first special offer</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
              <div 
                key={offer.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition ${
                  isExpired(offer.validUntil) ? 'opacity-60' : ''
                }`}
              >
                <div className="relative">
                  {offer.image ? (
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      loading="lazy"
                      className="w-full h-48 object-cover" 
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600">
                      <Avatar name={offer.title} size="2xl" shape="square" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        offer.isActive && !isExpired(offer.validUntil)
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {isExpired(offer.validUntil) 
                        ? 'Expired' 
                        : offer.isActive 
                          ? 'Active' 
                          : 'Inactive'
                      }
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-500 text-white">
                      {offer.discount}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{offer.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <FiCalendar />
                    <span className={isExpired(offer.validUntil) ? 'text-red-500' : ''}>
                      Valid until: {formatDate(offer.validUntil)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleActive(offer)} 
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center justify-center gap-1"
                      title={offer.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {offer.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      Toggle
                    </button>
                    <button 
                      onClick={() => { setEditOffer(offer); setShowModal(true); }} 
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center justify-center gap-1"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      onClick={() => deleteOffer(offer._id || offer.id)} 
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center justify-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editOffer ? 'Edit Offer' : 'Add New Offer'}
                </h2>
                <button 
                  onClick={() => { setShowModal(false); setEditOffer(null); }} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Offer Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Weekend Brunch Special"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Describe what makes this offer special..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount Text *</label>
                    <input
                      type="text"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                      className="input-field"
                      placeholder="e.g., 20% OFF or Buy 1 Get 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({...formData, image: url})}
                  label="Offer Image"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active (visible to customers)
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); setEditOffer(null); }} 
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editOffer ? 'Update Offer' : 'Add Offer'}
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

export default AdminTodaysOffers;
