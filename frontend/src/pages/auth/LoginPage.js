import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkPermission, hasRole } from '../../utils/permissions';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data } = await api.get('/site-settings');
      setMaintenanceMode(data.maintenanceMode?.enabled || false);
    } catch (error) {
      console.error('Failed to check maintenance mode:', error);
    }
  };

  const handleResetData = () => {
    if (window.confirm('This will reset all data including demo/admin users. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await login(formData);
      const userData = response.data.user;
      
      // Check if customer is trying to login during maintenance
      if (maintenanceMode && userData.role === 'customer') {
        toast.error('Site is under maintenance. Please wait until we are back online.');
        setLoading(false);
        return;
      }
      
      // Clear announcement dismissal on successful login so it shows again
      sessionStorage.removeItem('announcementDismissed');
      
      // Dispatch custom event for EditModeContext
      window.dispatchEvent(new Event('userLoggedIn'));
      
      toast.success('✓ Login successful! Redirecting...', { autoClose: 1500 });
      
      // Role-based redirection
      setTimeout(() => {
        if (userData.role === 'admin' || checkPermission(userData, 'dashboard.view')) {
          navigate('/admin/dashboard');
        } else if (hasRole(userData, 'chef') || checkPermission(userData, 'orders.view')) {
          navigate('/admin/orders');
        } else if (hasRole(userData, 'waiter') || checkPermission(userData, 'reservations.view')) {
          navigate('/admin/reservations');
        } else if (checkPermission(userData, 'menu.view') || checkPermission(userData, 'gallery.view')) {
          navigate('/admin/menu');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid username/email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-serif font-bold text-center mb-2 dark:text-gray-100">Welcome Back</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          Quick Login: <span className="font-semibold text-primary-600 dark:text-primary-400">demo/demo</span> or <span className="font-semibold text-primary-600 dark:text-primary-400">admin/admin</span>
        </p>
        
        {/* Quick Login Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFormData({ email: 'demo', password: 'demo' })}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium text-sm"
          >
            Demo Login
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'admin', password: 'admin' })}
            className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition font-medium text-sm"
          >
            Admin Login
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Username or Email</label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-field"
              placeholder="Enter your username or email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 underline"
          >
            Reset Data (if demo/admin not working)
          </button>
        </div>
        
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
