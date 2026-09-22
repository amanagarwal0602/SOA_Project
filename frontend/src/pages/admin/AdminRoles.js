import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminRoles = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState({});
  const [customTemplates, setCustomTemplates] = useState({});

  // Define all available permissions
  const availablePermissions = {
    'Dashboard': [
      { id: 'view_dashboard', name: 'View Dashboard', description: 'Access admin dashboard' },
      { id: 'view_analytics', name: 'View Analytics', description: 'View sales and analytics reports' }
    ],
    'Orders': [
      { id: 'view_orders', name: 'View Orders', description: 'View customer orders' },
      { id: 'edit_orders', name: 'Edit Orders', description: 'Update order status' },
      { id: 'delete_orders', name: 'Delete Orders', description: 'Cancel/delete orders' }
    ],
    'Menu': [
      { id: 'view_menu', name: 'View Menu', description: 'View menu items' },
      { id: 'add_menu', name: 'Add Menu Items', description: 'Create new menu items' },
      { id: 'edit_menu', name: 'Edit Menu', description: 'Update menu items' },
      { id: 'delete_menu', name: 'Delete Menu', description: 'Remove menu items' },
      { id: 'toggle_availability', name: 'Toggle Availability', description: 'Enable/disable menu items' }
    ],
    'Reservations': [
      { id: 'view_reservations', name: 'View Reservations', description: 'View table bookings' },
      { id: 'edit_reservations', name: 'Edit Reservations', description: 'Update reservation status' },
      { id: 'delete_reservations', name: 'Delete Reservations', description: 'Cancel reservations' }
    ],
    'Gallery': [
      { id: 'view_gallery', name: 'View Gallery', description: 'View gallery images' },
      { id: 'add_gallery', name: 'Add Images', description: 'Upload new images' },
      { id: 'edit_gallery', name: 'Edit Gallery', description: 'Update image details' },
      { id: 'delete_gallery', name: 'Delete Images', description: 'Remove images' }
    ],
    'Users': [
      { id: 'view_users', name: 'View Users', description: 'View user list' },
      { id: 'edit_users', name: 'Edit Users', description: 'Update user details' },
      { id: 'delete_users', name: 'Delete Users', description: 'Remove users' },
      { id: 'manage_roles', name: 'Manage Roles', description: 'Assign roles and permissions' }
    ],
    'Coupons': [
      { id: 'view_coupons', name: 'View Coupons', description: 'View discount codes' },
      { id: 'add_coupons', name: 'Add Coupons', description: 'Create new coupons' },
      { id: 'edit_coupons', name: 'Edit Coupons', description: 'Update coupons' },
      { id: 'delete_coupons', name: 'Delete Coupons', description: 'Remove coupons' }
    ],
    'Reviews': [
      { id: 'view_reviews', name: 'View Reviews', description: 'View customer reviews' },
      { id: 'edit_reviews', name: 'Edit Reviews', description: 'Moderate reviews' },
      { id: 'delete_reviews', name: 'Delete Reviews', description: 'Remove reviews' }
    ],
    'CMS Content': [
      { id: 'view_cms', name: 'View CMS', description: 'View website content' },
      { id: 'edit_hero', name: 'Edit Hero Section', description: 'Update homepage banner' },
      { id: 'edit_about', name: 'Edit About', description: 'Update about section' },
      { id: 'edit_features', name: 'Edit Features', description: 'Manage features' },
      { id: 'edit_team', name: 'Edit Team', description: 'Manage team members' },
      { id: 'edit_contact', name: 'Edit Contact Info', description: 'Update contact details' },
      { id: 'edit_settings', name: 'Edit Site Settings', description: 'Manage site configuration' },
      { id: 'edit_seo', name: 'Edit SEO', description: 'Manage SEO settings' }
    ]
  };

  // Predefined role templates
  const roleTemplates = {
    admin: {
      name: 'Administrator',
      permissions: Object.values(availablePermissions).flat().map(p => p.id)
    },
    manager: {
      name: 'Manager',
      permissions: [
        'view_dashboard', 'view_analytics',
        'view_orders', 'edit_orders',
        'view_menu', 'edit_menu', 'toggle_availability',
        'view_reservations', 'edit_reservations',
        'view_users',
        'view_coupons', 'add_coupons', 'edit_coupons',
        'view_reviews', 'edit_reviews'
      ]
    },
    chef: {
      name: 'Chef',
      permissions: [
        'view_dashboard',
        'view_orders', 'edit_orders',
        'view_menu', 'add_menu', 'edit_menu', 'toggle_availability'
      ]
    },
    waiter: {
      name: 'Waiter',
      permissions: [
        'view_orders', 'edit_orders',
        'view_menu',
        'view_reservations', 'edit_reservations'
      ]
    },
    content_editor: {
      name: 'Content Editor',
      permissions: [
        'view_dashboard',
        'view_cms', 'edit_hero', 'edit_about', 'edit_features', 'edit_team',
        'view_gallery', 'add_gallery', 'edit_gallery',
        'view_menu', 'edit_menu'
      ]
    },
    viewer: {
      name: 'Viewer',
      permissions: [
        'view_dashboard',
        'view_orders',
        'view_menu',
        'view_reservations',
        'view_gallery',
        'view_users',
        'view_coupons',
        'view_reviews',
        'view_cms'
      ]
    }
  };

  useEffect(() => {
    fetchUsers();
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = () => {
    const saved = localStorage.getItem('customRoleTemplates');
    if (saved) {
      setCustomTemplates(JSON.parse(saved));
    }
  };

  const saveCustomTemplates = (templates) => {
    localStorage.setItem('customRoleTemplates', JSON.stringify(templates));
    setCustomTemplates(templates);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // Handle different response structures
      const usersData = response.data?.data?.users || response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    // Parse existing permissions
    const userPerms = {};
    const existingPerms = user.permissions ? 
      (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : [];
    
    existingPerms.forEach(perm => {
      userPerms[perm] = true;
    });
    setPermissions(userPerms);
    setShowModal(true);
  };

  const handlePermissionToggle = (permId) => {
    setPermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleApplyTemplate = (templateKey) => {
    const template = roleTemplates[templateKey] || customTemplates[templateKey];
    const newPerms = {};
    template.permissions.forEach(perm => {
      newPerms[perm] = true;
    });
    setPermissions(newPerms);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplatePermissions({});
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (key, template) => {
    setEditingTemplate(key);
    setTemplateName(template.name);
    const perms = {};
    template.permissions.forEach(perm => {
      perms[perm] = true;
    });
    setTemplatePermissions(perms);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (key) => {
    if (window.confirm(`Delete template "${customTemplates[key].name}"?`)) {
      const updated = { ...customTemplates };
      delete updated[key];
      saveCustomTemplates(updated);
      toast.success('✓ Template deleted!', { autoClose: 2000 });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const selectedPerms = Object.keys(templatePermissions).filter(key => templatePermissions[key]);
    if (selectedPerms.length === 0) {
      alert('Please select at least one permission');
      return;
    }

    // If editing a built-in template, create a new custom template with a modified key
    let templateKey;
    if (editingTemplate && !customTemplates[editingTemplate]) {
      // Editing built-in template - create as custom
      templateKey = 'custom_' + editingTemplate + '_' + Date.now();
    } else {
      // Creating new or editing existing custom
      templateKey = editingTemplate || templateName.toLowerCase().replace(/\s+/g, '_');
    }

    const updated = {
      ...customTemplates,
      [templateKey]: {
        name: templateName,
        permissions: selectedPerms,
        custom: true
      }
    };

    saveCustomTemplates(updated);
    setShowTemplateModal(false);
    toast.success(editingTemplate && !customTemplates[editingTemplate] 
      ? '✓ Template saved as custom!' 
      : editingTemplate 
        ? '✓ Template updated!' 
        : '✓ Template created!', { autoClose: 2000 });
  };

  const handleTemplatePermissionToggle = (permId) => {
    setTemplatePermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const getAllTemplates = () => {
    return { ...roleTemplates, ...customTemplates };
  };

  const handleSavePermissions = async () => {
    try {
      const selectedPermissions = Object.keys(permissions).filter(key => permissions[key]);
      
      await api.put(`/users/${selectedUser.id}`, {
        permissions: JSON.stringify(selectedPermissions),
        role: selectedUser.role
      });

      toast.success('✓ Permissions updated!', { autoClose: 2000 });
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success('✓ Role updated!', { autoClose: 2000 });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getPermissionCount = (user) => {
    if (!user.permissions) return 0;
    const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    return Array.isArray(perms) ? perms.length : 0;
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        
        return name.includes(searchLower) ||
               email.includes(searchLower) ||
               username.includes(searchLower) ||
               role.includes(searchLower);
      });
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">User Roles & Permissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage user access rights and assign specific permissions</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="content_editor">Content Editor</option>
              <option value="customer">Customer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Role Templates Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Quick Role Templates:</h3>
          <button
            onClick={handleCreateTemplate}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <span>+</span> Create Template
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(getAllTemplates()).map(([key, template]) => (
            <div 
              key={key} 
              className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border-2 border-blue-300 hover:border-blue-400 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm truncate">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {template.permissions.length} permissions
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEditTemplate(key, template)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                    title="Edit template"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {template.custom && (
                    <button
                      onClick={() => handleDeleteTemplate(key)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                      title="Delete template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
          💡 Click edit to customize any template. Built-in templates will be saved as custom templates when edited.
        </p>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium">{searchTerm || roleFilter !== 'all' ? 'No users found matching your filters' : 'No users available'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700 dark:text-gray-300">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-400"
                    disabled={user.role === 'admin' && user.email === 'admin@lumierecafe.com'}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="chef">Chef</option>
                    <option value="waiter">Waiter</option>
                    <option value="content_editor">Content Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-700 shadow-sm">
                    <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    {getPermissionCount(user)} permissions
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                    user.is_active 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></span>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEditPermissions(user)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Manage
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {searchTerm || roleFilter !== 'all' ? 'No users found matching your filters' : 'No users available'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{user.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{user.email}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                user.is_active 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                  user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Role</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  disabled={user.role === 'admin' && user.email === 'admin@lumierecafe.com'}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-700 shadow-sm">
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {getPermissionCount(user)} permissions
                </span>
                <button
                  onClick={() => handleEditPermissions(user)}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Manage
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Edit Permissions Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Manage Permissions: {selectedUser.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedUser.email}</p>
              
              {/* Role Templates */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Apply Role Template:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(getAllTemplates()).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => handleApplyTemplate(key)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                    >
                      {template.name} ({template.permissions.length})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Permissions by Category */}
              {Object.entries(availablePermissions).map(([category, perms]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-600 pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={permissions[perm.id] || false}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="mt-1 mr-3 flex-shrink-0 h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{perm.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 order-2 sm:order-1"
              >
                Cancel
              </button>
              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setPermissions({})}
                  className="w-full sm:w-auto px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Clear All
                </button>
                <button
                  onClick={() => handleApplyTemplate('admin')}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              
              {/* Template Name */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Kitchen Staff, Delivery Driver"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select permissions for this role template:
              </p>
              
              {/* Permissions by Category */}
              {Object.entries(availablePermissions).map(([category, perms]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-600 pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={templatePermissions[perm.id] || false}
                          onChange={() => handleTemplatePermissionToggle(perm.id)}
                          className="mt-1 mr-3 flex-shrink-0 h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{perm.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-4 border-t flex justify-between">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setTemplatePermissions({})}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;

