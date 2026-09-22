import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MaintenanceMode = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  // Allow access to login and register pages even during maintenance
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/site-settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show maintenance page if enabled and user is a customer (or not logged in)
  // Allow admin, staff, and other roles to access normally
  // Always allow access to login/register pages
  if (settings?.maintenanceMode?.enabled && (!user || user?.role === 'customer') && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-primary-500 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Under Maintenance
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {settings.maintenanceMode.message || 'We are currently under maintenance. Please check back soon.'}
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              We'll be back online shortly. Thank you for your patience!
            </p>
            
            {/* Login Link */}
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the app normally
  return children;
};

export default MaintenanceMode;
