import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import api from '../../services/api';
import EditableWrapper from '../EditableWrapper';
import EditModal from '../EditModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [about, setAbout] = useState(null);
  const [contact, setContact] = useState(null);
  const { settings } = useSiteSettings();
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const [aboutRes, contactRes] = await Promise.all([
        api.get('/about'),
        api.get('/contact-info')
      ]);
      setAbout(aboutRes.data);
      setContact(contactRes.data);
    } catch (error) {
      console.error('Failed to load footer data:', error);
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchFooterData();
    setEditModal({ isOpen: false, type: '', data: null });
  };

  const hours = contact?.openingHours || contact?.hours || {};

  return (
    <footer className="bg-brown-500 dark:bg-gray-900 text-white dark:text-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <EditableWrapper
            onEdit={() => handleEdit('footer-about', about)}
          >
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">{about?.title || 'Lumière Café'}</h3>
              <p className="text-gray-200 dark:text-gray-400 mb-4">
                {about?.description || 'Experience the perfect blend of artisan coffee, fresh pastries, and warm hospitality in an elegant atmosphere.'}
              </p>
              <div className="flex space-x-4">
                {contact?.socialFacebook || contact?.socialMedia?.facebook ? (
                  <a 
                    href={contact.socialFacebook || contact.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary-300"
                  >
                    <FiFacebook className="w-5 h-5" />
                  </a>
                ) : null}
                {contact?.socialInstagram || contact?.socialMedia?.instagram ? (
                  <a 
                    href={contact.socialInstagram || contact.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary-300"
                  >
                    <FiInstagram className="w-5 h-5" />
                  </a>
                ) : null}
                {contact?.socialTwitter || contact?.socialMedia?.twitter ? (
                  <a 
                    href={contact.socialTwitter || contact.socialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary-300"
                  >
                    <FiTwitter className="w-5 h-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </EditableWrapper>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/menu" className="text-gray-200 dark:text-gray-400 hover:text-primary-300 dark:hover:text-primary-400">Menu</Link></li>
              <li><Link to="/about" className="text-gray-200 dark:text-gray-400 hover:text-primary-300 dark:hover:text-primary-400">About Us</Link></li>
              <li><Link to="/gallery" className="text-gray-200 dark:text-gray-400 hover:text-primary-300 dark:hover:text-primary-400">Gallery</Link></li>
              <li><Link to="/reservations" className="text-gray-200 dark:text-gray-400 hover:text-primary-300 dark:hover:text-primary-400">Reservations</Link></li>
              <li><Link to="/contact" className="text-gray-200 dark:text-gray-400 hover:text-primary-300 dark:hover:text-primary-400">Contact</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <EditableWrapper
            onEdit={() => handleEdit('opening-hours', hours)}
          >
            <div>
              <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-gray-200 dark:text-gray-400">
                {Object.entries(hours).map(([day, time]) => (
                  <li key={day} className="flex justify-between">
                    <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </EditableWrapper>

          {/* Contact Info */}
          <EditableWrapper
            onEdit={() => handleEdit('contact-info', contact)}
          >
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-gray-200 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>{contact?.addressStreet}, {contact?.addressCity}, {contact?.addressState} {contact?.addressZipcode}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FiPhone className="w-5 h-5 flex-shrink-0" />
                  <span>{contact?.phone || '(555) 123-4567'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FiMail className="w-5 h-5 flex-shrink-0" />
                  <span>{contact?.email || 'hello@lumierecafe.com'}</span>
                </li>
              </ul>
            </div>
          </EditableWrapper>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-400 dark:border-gray-700 mt-8 pt-8 text-center text-gray-200 dark:text-gray-400">
          <p>{settings.footerText || `© ${currentYear} ${about?.title || 'Lumière Café'}. All rights reserved.`}</p>
          <p className="mt-2 text-sm">
            Crafted with passion and attention to detail.
          </p>
        </div>
      </div>

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </footer>
  );
};

export default Footer;
