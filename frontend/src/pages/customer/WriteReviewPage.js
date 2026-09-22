import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get menu item from navigation state (if coming from order)
  const menuItem = location.state?.menuItem || null;
  const orderId = location.state?.orderId || null;
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    menuItem: menuItem?._id || '',
    order: orderId || '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!formData.menuItem) {
      toast.error('Please select a menu item to review');
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', formData);
      toast.success('✓ Review submitted! Thank you for your feedback.');
      setTimeout(() => navigate('/customer/orders'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = interactive 
        ? starValue <= (hoveredRating || formData.rating)
        : starValue <= rating;
      
      return (
        <FiStar
          key={index}
          size={interactive ? 32 : 24}
          className={`${interactive ? 'cursor-pointer' : ''} transition-colors ${
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          onClick={interactive ? () => setFormData({...formData, rating: starValue}) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-serif font-bold mb-2 dark:text-gray-100">Write a Review</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your dining experience with us</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Menu Item Selection (if not pre-selected) */}
            {!menuItem && (
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Menu Item <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.menuItem}
                  onChange={(e) => setFormData({...formData, menuItem: e.target.value})}
                  className="input-field"
                  placeholder="Enter menu item ID or select from your orders"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Go to "My Orders" and click "Write Review" on an item you've ordered
                </p>
              </div>
            )}

            {/* Display selected menu item */}
            {menuItem && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Reviewing:</p>
                <div className="flex items-center gap-3">
                  {menuItem.image && (
                    <img 
                      src={menuItem.image} 
                      alt={menuItem.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg dark:text-gray-100">{menuItem.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">₹{menuItem.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {renderStars(formData.rating, true)}
                <span className="ml-2 text-lg font-semibold dark:text-gray-200">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Review Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                placeholder="Summarize your experience"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="input-field"
                rows="6"
                placeholder="Tell us about your experience... What did you enjoy? What could be improved?"
                minLength={10}
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/1000 characters</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Review Guidelines:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on your personal experience</li>
            <li>• Avoid offensive or inappropriate language</li>
            <li>• Reviews are moderated and may take time to appear</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPage;
