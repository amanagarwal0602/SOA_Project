import React, { useState, useEffect } from 'react';
import { FiDatabase, FiSave, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import storageConfig, { updateStorageConfig, getStorageMode, getMongoDBUri } from '../../config/storageConfig';

const StorageConfigPage = () => {
  const [mode, setMode] = useState(getStorageMode());
  const [mongoUri, setMongoUri] = useState(getMongoDBUri());
  const [apiUrl, setApiUrl] = useState(storageConfig.apiBaseUrl);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      // Validate MongoDB URI if mode is mongodb
      if (mode === 'mongodb' && !mongoUri) {
        setError('MongoDB URI is required when using MongoDB mode');
        return;
      }

      // Update configuration
      updateStorageConfig({
        mode,
        mongodbUri: mongoUri,
        apiBaseUrl: apiUrl
      });

      setSaved(true);
      setError('');
      
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  const testConnection = async () => {
    if (mode === 'mongodb' && mongoUri) {
      try {
        setError('');
        // Test MongoDB connection by hitting a health endpoint
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setError('Failed to connect to API');
        }
      } catch (err) {
        setError('Connection test failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FiDatabase className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold dark:text-white">Storage Configuration</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Configure how your application stores data. Use localStorage for development and MongoDB for production deployment.
          </p>

          {/* Alerts */}
          {saved && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Configuration saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Storage Mode */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Storage Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('localStorage')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'localStorage'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg dark:text-white">localStorage</h3>
                  {mode === 'localStorage' && (
                    <FiCheckCircle className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browser storage for development and testing
                </p>
              </button>

              <button
                onClick={() => setMode('mongodb')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'mongodb'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg dark:text-white">MongoDB</h3>
                  {mode === 'mongodb' && (
                    <FiCheckCircle className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cloud database for production deployment
                </p>
              </button>
            </div>
          </div>

          {/* MongoDB Configuration */}
          {mode === 'mongodb' && (
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">MongoDB Configuration</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  MongoDB Connection String *
                </label>
                <input
                  type="password"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://username:password@cluster.mongodb.net/dbname"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Get your connection string from MongoDB Atlas dashboard
                </p>
              </div>

              <button
                onClick={testConnection}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Test Connection
              </button>
            </div>
          )}

          {/* API Base URL */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5000/api"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Change this to your production API URL when deploying
            </p>
          </div>

          {/* Important Notes */}
          <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 dark:text-white">
              <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Development:</strong> Use localStorage mode with sample data</li>
              <li>• <strong>Production:</strong> Switch to MongoDB mode and add your connection string</li>
              <li>• <strong>No data loss:</strong> Your localStorage data remains intact when switching modes</li>
              <li>• <strong>Easy switch:</strong> You can switch between modes anytime without affecting your site</li>
              <li>• <strong>After saving:</strong> Restart your server for changes to take effect</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              <FiSave className="w-5 h-5" />
              Save Configuration
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
            >
              <FiRefreshCw className="w-5 h-5" />
              Reload App
            </button>
          </div>

          {/* Current Status */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 dark:text-white">Current Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Storage Mode:</span>
                <span className="ml-2 font-semibold text-primary-600">
                  {getStorageMode()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">API URL:</span>
                <span className="ml-2 font-mono text-xs dark:text-gray-300">
                  {storageConfig.apiBaseUrl}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageConfigPage;
