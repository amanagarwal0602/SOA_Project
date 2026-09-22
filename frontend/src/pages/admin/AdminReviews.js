import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiTrash2, FiMessageSquare, FiX, FiHome, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/admin/reviews');
      setReviews(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load reviews');
      setReviews([]);
    }
  };

  const togglePublish = async (reviewId) => {
    try {
      setActionStatus({ [reviewId]: 'publishing' });
      await api.put(`/admin/reviews/${reviewId}/toggle-publish`);
      toast.success('✓ Status updated!', { autoClose: 2000 });
      setActionStatus({ [reviewId]: 'success' });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update');
      setActionStatus({});
    }
  };

  const toggleHomepage = async (reviewId) => {
    try {
      setActionStatus({ [reviewId]: 'homepage' });
      await api.put(`/reviews/${reviewId}/toggle-homepage`);
      toast.success('✓ Homepage updated!', { autoClose: 2000 });
      setActionStatus({ [reviewId]: 'success' });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update');
      setActionStatus({});
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        toast.success('✓ Review deleted!', { autoClose: 2000 });
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handleResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    try {
      await api.put(`/reviews/${selectedReview._id}/respond`, { response: responseText });
      toast.success('✓ Response added!', { autoClose: 2000 });
      setShowResponseModal(false);
      setResponseText('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'published') return review.isPublished;
    if (filter === 'unpublished') return !review.isPublished;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Review Management</h1>
          <p className="text-gray-600 dark:text-gray-400">{reviews.length} total reviews</p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg ${filter === 'published' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            Published ({reviews.filter(r => r.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('unpublished')}
            className={`px-4 py-2 rounded-lg ${filter === 'unpublished' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            Unpublished ({reviews.filter(r => !r.isPublished).length})
          </button>
        </div>

        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="flex justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{review.title}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    By {review.user?.name || review.userName || 'Customer'} • {review.createdAt || review.created_at ? new Date(review.createdAt || review.created_at).toLocaleDateString() : 'Recent'}
                  </p>
                  {review.isVerifiedPurchase && (
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded">✓ Verified Purchase</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublish(review._id)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      review.isPublished ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  >
                    {review.isPublished ? 'Published' : 'Unpublished'}
                  </button>
                  <button
                    onClick={() => toggleHomepage(review._id)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${
                      review.showOnHomepage ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    title={review.showOnHomepage ? 'Remove from homepage' : 'Show on homepage'}
                  >
                    <FiHome className="w-4 h-4" />
                    {review.showOnHomepage ? 'On Homepage' : 'Add to Home'}
                  </button>
                  <button
                    onClick={() => { setSelectedReview(review); setResponseText(review.adminResponse?.response || ''); setShowResponseModal(true); }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FiMessageSquare className="inline mr-1" /> {review.adminResponse ? 'Edit' : 'Respond'}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
              
              {review.adminResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Admin Response:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-400">{review.adminResponse.response}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                    {new Date(review.adminResponse.respondedAt).toLocaleDateString()} by {review.adminResponse.respondedBy?.name || 'Admin'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Respond to Review</h2>
                <button onClick={() => { setShowResponseModal(false); setSelectedReview(null); setResponseText(''); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{selectedReview?.title}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedReview?.comment}</p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="Thank you for your feedback..."
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setShowResponseModal(false); setSelectedReview(null); setResponseText(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                  <button onClick={handleResponse} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;

