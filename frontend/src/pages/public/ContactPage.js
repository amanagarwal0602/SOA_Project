import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await api.get('/contact-info');
      setContactInfo(response.data);
    } catch (error) {
      console.error('Failed to load contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/contact-info/send-message', formData);
      toast.success('✓ Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchContactInfo();
    setEditModal({ isOpen: false, type: '', data: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const hours = contactInfo?.openingHours || contactInfo?.hours || {};

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="bg-brown-500 dark:bg-gray-800 text-white dark:text-gray-200 py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Contact Us</h1>
          <p className="text-xl">We'd love to hear from you</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                required
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="input-field"
                rows="5"
                required
              />
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold mb-6">Visit Us</h2>
            <EditableWrapper
              onEdit={() => handleEdit('contact-info', contactInfo)}
            >
              <div>
                <div className="flex items-start space-x-4 mb-3">
                  <FiMapPin className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {contactInfo?.addressStreet}<br />
                      {contactInfo?.addressCity}, {contactInfo?.addressState} {contactInfo?.addressZipcode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 mb-3">
                  <FiPhone className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400">{contactInfo?.phone || '(555) 123-4567'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 mb-3">
                  <FiMail className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400">{contactInfo?.email || 'hello@lumierecafe.com'}</p>
                  </div>
                </div>
                <EditableWrapper
                  onEdit={() => handleEdit('opening-hours', hours)}
                >
                  <div className="flex items-start space-x-4">
                    <FiClock className="w-6 h-6 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Hours</h3>
                      <div className="text-gray-600 dark:text-gray-400">
                        {Object.entries(hours).map(([day, time]) => (
                          <div key={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}: {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </EditableWrapper>
              </div>
            </EditableWrapper>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </div>
  );
};

export default ContactPage;


