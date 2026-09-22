import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiTrash2, FiCheck, FiX, FiSend } from 'react-icons/fi';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/contact-info/messages', { params });
      const messagesData = response.data?.data?.messages || response.data?.messages || response.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateMessageStatus = async (id, status, replyMessage = null) => {
    try {
      const updateData = { status };
      if (replyMessage) {
        updateData.replyMessage = replyMessage;
      }
      
      await api.put(`/contact-info/messages/${id}`, updateData);
      toast.success('✓ Status updated!', { autoClose: 2000 });
      fetchMessages();
      setShowReplyModal(false);
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await api.delete(`/contact-info/messages/${id}`);
      toast.success('✓ Message deleted!', { autoClose: 2000 });
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
  };

  const submitReply = () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    updateMessageStatus(selectedMessage._id, 'replied', replyText);
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      replied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return badges[status] || badges.unread;
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const readCount = messages.filter(m => m.status === 'read').length;
  const repliedCount = messages.filter(m => m.status === 'replied').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contact Messages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer inquiries and messages
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</p>
            </div>
            <FiMail className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{unreadCount}</p>
            </div>
            <FiMail className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{readCount}</p>
            </div>
            <FiMail className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Replied</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{repliedCount}</p>
            </div>
            <FiCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'read'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Read ({readCount})
          </button>
          <button
            onClick={() => setStatusFilter('replied')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'replied'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <FiMail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' ? 'No messages yet' : `No ${statusFilter} messages`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  message.status === 'unread' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      message.status === 'unread' 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {message.status === 'unread' ? (
                        <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{message.name}</h3>
                      <a 
                        href={`mailto:${message.email}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {message.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                  {message.message}
                </p>

                {message.replied && message.replyMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Your Reply:</p>
                    <p className="text-sm text-green-700 dark:text-green-400">{message.replyMessage}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                      Replied on {new Date(message.repliedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {message.status === 'unread' && (
                    <button
                      onClick={() => updateMessageStatus(message._id, 'read')}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Mark as Read</span>
                    </button>
                  )}
                  {message.status !== 'replied' && (
                    <button
                      onClick={() => handleReply(message)}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <FiSend className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reply to Message</h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedMessage(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From: {selectedMessage.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedMessage.email}</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedMessage.message}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Type your reply here..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Note: This will be saved for your records. To actually send an email, copy this text and send it manually to {selectedMessage.email}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiSend className="w-4 h-4" />
                <span>Save Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;
