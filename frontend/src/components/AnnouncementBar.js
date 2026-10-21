import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AnnouncementBar = () => {
  const [settings, setSettings] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchSettings();
    checkIfDismissed();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/site-settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load site settings:', error);
    }
  };

  const checkIfDismissed = () => {
    const dismissed = sessionStorage.getItem('announcementDismissed');
    if (dismissed === 'true') {
      setVisible(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('announcementDismissed', 'true');
  };

  const bar = settings?.announcementBar;
  const isBarEnabled = bar && bar.enabled !== false && (bar.message || bar.text);

  if (!settings || !isBarEnabled || !visible) {
    return null;
  }

  const message = bar.message || bar.text;
  const backgroundColor = bar.backgroundColor || '#78350f';
  const textColor = bar.textColor || '#ffffff';

  return (
    <div
      className="w-full py-3 px-4 text-center relative"
      style={{
        backgroundColor: backgroundColor || '#3b82f6',
        color: textColor || '#ffffff'
      }}
    >
      <p className="text-sm md:text-base font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-current hover:opacity-75"
        aria-label="Close announcement"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default AnnouncementBar;
