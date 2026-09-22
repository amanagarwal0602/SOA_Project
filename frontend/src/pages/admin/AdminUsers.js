import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showUserOrdersModal, setShowUserOrdersModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: ''
  });

  // Available permissions
  const availablePermissions = [
    { key: 'view_dashboard', label: 'View Dashboard', category: 'Dashboard' },
    { key: 'view_orders', label: 'View Orders', category: 'Orders' },
    { key: 'edit_orders', label: 'Edit Orders', category: 'Orders' },
    { key: 'delete_orders', label: 'Delete Orders', category: 'Orders' },
    { key: 'view_menu', label: 'View Menu', category: 'Menu' },
    { key: 'add_menu', label: 'Add Menu Items', category: 'Menu' },
    { key: 'edit_menu', label: 'Edit Menu Items', category: 'Menu' },
    { key: 'delete_menu', label: 'Delete Menu Items', category: 'Menu' },
    { key: 'view_reservations', label: 'View Reservations', category: 'Reservations' },
    { key: 'edit_reservations', label: 'Edit Reservations', category: 'Reservations' },
    { key: 'delete_reservations', label: 'Delete Reservations', category: 'Reservations' },
    { key: 'view_gallery', label: 'View Gallery', category: 'Gallery' },
    { key: 'add_gallery', label: 'Add Gallery Items', category: 'Gallery' },
    { key: 'view_reviews', label: 'View Reviews', category: 'Reviews' },
    { key: 'edit_reviews', label: 'Edit Reviews', category: 'Reviews' },
    { key: 'view_users', label: 'View Users', category: 'Users' },
    { key: 'edit_users', label: 'Edit Users', category: 'Users' },
    { key: 'view_coupons', label: 'View Coupons', category: 'Coupons' },
    { key: 'add_coupons', label: 'Add Coupons', category: 'Coupons' },
    { key: 'edit_coupons', label: 'Edit Coupons', category: 'Coupons' },
  ];

  // Role templates
  const roleTemplates = {
    chef: {
      label: '👨‍🍳 Chef',
      permissions: ['view_dashboard', 'view_orders', 'edit_orders', 'view_menu', 'edit_menu']
    },
    waiter: {
      label: '🍽️ Waiter/Server',
      permissions: ['view_dashboard', 'view_orders', 'edit_orders', 'view_reservations', 'edit_reservations', 'view_menu']
    },
    manager: {
      label: '💼 Manager',
      permissions: ['view_dashboard', 'view_orders', 'edit_orders', 'delete_orders', 'view_menu', 'add_menu', 'edit_menu', 'delete_menu', 'view_reservations', 'edit_reservations', 'delete_reservations', 'view_users', 'view_coupons', 'edit_coupons', 'view_reviews']
    },
    content_editor: {
      label: '✏️ Content Editor',
      permissions: ['view_dashboard', 'view_gallery', 'add_gallery', 'view_reviews', 'edit_reviews', 'view_menu', 'edit_menu']
    },
    kitchen_staff: {
      label: '🔪 Kitchen Staff',
      permissions: ['view_dashboard', 'view_orders', 'view_menu']
    },
    cashier: {
      label: '💰 Cashier',
      permissions: ['view_dashboard', 'view_orders', 'edit_orders', 'view_coupons']
    },
    receptionist: {
      label: '📞 Receptionist',
      permissions: ['view_dashboard', 'view_reservations', 'edit_reservations', 'view_orders']
    },
    delivery_person: {
      label: '🚗 Delivery Person',
      permissions: ['view_dashboard', 'view_orders']
    },
    customer: {
      label: '👤 Customer',
      permissions: []
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Handle different response structures
      const usersData = response.data?.data?.users || response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  // Calculate total order value for each user
  const getUserOrderValue = (userId) => {
    return orders
      .filter(order => order.user_id === userId || order.userId === userId)
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  };

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
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

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'role':
          return (a.role || '').localeCompare(b.role || '');
        case 'totalOrders':
          return getUserOrderValue(b.id) - getUserOrderValue(a.id);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  const toggleActive = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      await api.put(`/users/${userId}`, { is_active: !user.is_active });
      toast.success('✓ User status updated!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Use plain text password for simplicity
      await api.put(`/users/${selectedUser.id}`, { password: newPassword });
      toast.success('✓ Password updated!');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const togglePermission = (permissionKey) => {
    if (!selectedUser) return;
    
    const currentPerms = Array.isArray(selectedUser.permissions) 
      ? selectedUser.permissions 
      : (typeof selectedUser.permissions === 'string' ? JSON.parse(selectedUser.permissions) : []);
    
    const hasPermission = currentPerms.includes(permissionKey);
    const newPermissions = hasPermission
      ? currentPerms.filter(p => p !== permissionKey)
      : [...currentPerms, permissionKey];
    
    setSelectedUser({
      ...selectedUser,
      permissions: newPermissions
    });
  };

  const savePermissions = async () => {
    try {
      await api.put(`/users/${selectedUser.id}`, { 
        permissions: selectedUser.permissions 
      });
      toast.success('✓ Permissions updated!');
      setShowPermissionsModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const getUserPermissions = (user) => {
    if (user.role === 'admin') return ['all'];
    if (!user.permissions) return [];
    return Array.isArray(user.permissions) 
      ? user.permissions 
      : (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : []);
  };

  const openUserOrdersModal = (user) => {
    setSelectedUser(user);
    setShowUserOrdersModal(true);
  };

  const getUserOrders = () => {
    if (!selectedUser) return [];
    return orders.filter(order => 
      (order.user_id === selectedUser.id || order.userId === selectedUser.id)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const applyRoleTemplate = (role) => {
    if (!selectedUser || !roleTemplates[role]) return;
    setSelectedUser({
      ...selectedUser,
      permissions: roleTemplates[role].permissions
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserData);
      toast.success('✓ User created!');
      setShowCreateUserModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'customer', phone: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            + Create New User
          </button>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search by Name or Email
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
                <option value="customer">Customer</option>
                <option value="content_editor">Content Editor</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="name">Name (A-Z)</option>
                <option value="email">Email (A-Z)</option>
                <option value="role">Role (A-Z)</option>
                <option value="totalOrders">Total Order Value (High to Low)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredUsers.map(user => {
                const orderValue = getUserOrderValue(user.id);
                
                return (
                  <tr 
                    key={user.id} 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetailsModal(true);
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-white font-bold text-base">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-mono border border-gray-300 dark:border-gray-600">
                        {user.password || '••••••••'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm">
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        ₹{Math.round(orderValue).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* User Information Cards */}
            <div className="space-y-4">
              {/* Role Card */}
              <div className="bg-gradient-to-r from-slate-50 to-teal-50 dark:from-slate-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</h3>
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-slate-100 to-teal-100 dark:from-slate-800 dark:to-teal-800 text-slate-800 dark:text-slate-100 rounded-lg text-sm font-bold border border-slate-300 dark:border-slate-600 shadow-sm">
                  {selectedUser.role}
                </span>
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Status</h3>
                <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-lg shadow-sm ${
                  selectedUser.is_active 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    selectedUser.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></span>
                  {selectedUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Orders Card */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Orders Summary</h3>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-800 dark:to-cyan-800 text-teal-700 dark:text-teal-100 rounded-lg text-sm font-bold border border-teal-300 dark:border-teal-600 shadow-sm">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    {orders.filter(o => (o.user_id === selectedUser.id || o.userId === selectedUser.id) && o.status !== 'cancelled').length} Orders
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800 text-emerald-700 dark:text-emerald-100 rounded-lg text-sm font-bold border border-emerald-300 dark:border-emerald-600 shadow-sm">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    ₹{Math.round(getUserOrderValue(selectedUser.id)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  openUserOrdersModal(selectedUser);
                  setShowUserDetailsModal(false);
                }} 
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View All Orders ({orders.filter(o => (o.user_id === selectedUser.id || o.userId === selectedUser.id) && o.status !== 'cancelled').length})
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  openPermissionsModal(selectedUser);
                  setShowUserDetailsModal(false);
                }} 
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                Manage Permissions ({getUserPermissions(selectedUser).length})
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive(selectedUser.id);
                  setShowUserDetailsModal(false);
                }} 
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Toggle Account Status
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  openPasswordModal(selectedUser);
                  setShowUserDetailsModal(false);
                }} 
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Reset Password
              </button>

              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Reset Password for {selectedUser?.name}</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Manage Permissions for {selectedUser?.name}</h2>
            
            {selectedUser.role === 'admin' ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  🔐 Admin users have full access to all features
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select which admin features this user can access. Selected permissions will appear in their dashboard.
                </p>
                
                {/* Quick Role Templates */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      ⚡ Quick Apply Role Template
                    </label>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Click to auto-fill permissions
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(roleTemplates).map(([roleKey, roleData]) => {
                      const isActive = selectedUser?.permissions && 
                        JSON.stringify([...selectedUser.permissions].sort()) === 
                        JSON.stringify([...roleData.permissions].sort());
                      
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => applyRoleTemplate(roleKey)}
                          className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-semibold">{roleData.label}</div>
                            <div className="text-xs opacity-75">
                              {roleData.permissions.length} permissions
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Search in permissions */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={permissionSearchTerm}
                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                    placeholder="Search permissions..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                
                <div className="space-y-6">
                  {Object.entries(
                    availablePermissions
                      .filter(perm => 
                        !permissionSearchTerm || 
                        perm.label.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                        perm.category.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                      )
                      .reduce((acc, perm) => {
                        if (!acc[perm.category]) acc[perm.category] = [];
                        acc[perm.category].push(perm);
                        return acc;
                      }, {})
                  ).map(([category, perms]) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const userPerms = getUserPermissions(selectedUser);
                          const isChecked = userPerms.includes(perm.key);
                          
                          return (
                            <label 
                              key={perm.key} 
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPermissionsModal(false);
                      setSelectedUser(null);
                      setPermissionSearchTerm('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePermissions}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Save Permissions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* User Orders Modal */}
      {showUserOrdersModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders by {selectedUser?.name}</h2>
              <button
                onClick={() => {
                  setShowUserOrdersModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{getUserOrders().length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{Math.round(getUserOrderValue(selectedUser.id))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {getUserOrders().filter(o => o.status === 'ready').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getUserOrders().filter(o => o.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>

            {getUserOrders().length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No orders found for this user
              </div>
            ) : (
              <div className="space-y-3">
                {getUserOrders().map(order => (
                  <div key={order._id || order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Order #{order.dailyOrderNumber || order.daily_order_number || 'N/A'} - {
                            order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date unknown'
                          }
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">₹{Math.round(order.total || order.totalPrice || 0)}</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(order.status || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Items:</strong> {order.items?.length || 0} items</p>
                      <p><strong>Payment:</strong> {order.paymentMethod || order.payment_method || 'N/A'}</p>
                      <p><strong>Type:</strong> {order.deliveryType || order.delivery_type || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowUserOrdersModal(false);
                  setSelectedUser(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300 text-gray-900 dark:text-gray-100"
                >
                  <option value="customer">Customer</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                  <option value="manager">Manager</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setNewUserData({ name: '', email: '', password: '', role: 'customer', phone: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

