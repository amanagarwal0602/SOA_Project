import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserByUsername } from '../../services/localStorage';
import { toast } from 'react-toastify';
import Avatar from '../../components/common/Avatar';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameAvailable(false);
      return;
    }

    // Username validation: alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setUsernameAvailable(false);
      return;
    }

    // Reserved usernames
    const reserved = ['admin', 'demo', 'root', 'system', 'lumiere', 'cafe'];
    if (reserved.includes(username.toLowerCase())) {
      setUsernameError('This username is reserved');
      setUsernameAvailable(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError('');
    
    try {
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        setUsernameError('Username is already taken');
        setUsernameAvailable(false);
      } else {
        setUsernameError('');
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Could not verify username');
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setFormData({...formData, username});
    
    // Reset availability state when user types
    setUsernameAvailable(null);
    setUsernameError('');
    
    // Debounce check
    if (username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.username || formData.username.length < 3) {
      toast.error('Please enter a valid username (minimum 3 characters)');
      return;
    }

    if (usernameAvailable === false || usernameError) {
      toast.error('Please choose a valid and available username');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('✓ Registration successful! Redirecting...', { autoClose: 1500 });
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-serif font-bold text-center mb-2 dark:text-gray-100">Create Account</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">Join Lumière Café today</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex justify-center mb-4">
            <Avatar 
              name={formData.name || 'User'} 
              image={formData.avatar} 
              size="xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Username
              {usernameChecking && <span className="text-gray-400 text-xs ml-2">checking...</span>}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={handleUsernameChange}
              className={`input-field ${
                usernameAvailable === true ? 'border-green-500 dark:border-green-400' : 
                usernameAvailable === false ? 'border-red-500 dark:border-red-400' : ''
              }`}
              required
              minLength="3"
              maxLength="20"
              placeholder="Choose a unique username"
            />
            {usernameAvailable === true && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-1">✓ Username is available</p>
            )}
            {usernameError && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">✗ {usernameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="input-field"
              required
              minLength="6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Profile Image URL <span className="text-xs text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to use your initials as avatar
            </p>
          </div>
          <button 
            type="submit" 
            disabled={loading || usernameAvailable === false || usernameChecking} 
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
