import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.data);
      toast.success('✓ Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-2xl">
        <h1 className="text-4xl font-serif font-bold mb-8">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                className="input-field bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Update Profile</button>
          </form>
        </div>

        {/* User Permissions Display */}
        {user && (user.role === 'admin' || user.role === 'staff' || (user.permissions && user.permissions.length > 0)) && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mt-6">
            <h2 className="text-2xl font-serif font-bold mb-4">Your Role & Permissions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {user.role || 'customer'}
                </span>
              </div>
              {user.permissions && user.permissions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map(perm => (
                      <span key={perm} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(!user.permissions || user.permissions.length === 0) && user.role === 'customer' && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">You have standard customer access to browse menu, place orders, make reservations, and write reviews.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

