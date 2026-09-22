// Permission utility functions

export const checkPermission = (user, permission) => {
  if (!user) return false;
  
  // Super admin always has all permissions
  if (user.role === 'admin') {
    return true;
  }
  
  // Parse permissions from user object
  let userPermissions = [];
  if (user.permissions) {
    userPermissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : user.permissions;
  }
  
  return Array.isArray(userPermissions) && userPermissions.includes(permission);
};

export const checkAnyPermission = (user, permissions) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.some(perm => checkPermission(user, perm));
};

export const checkAllPermissions = (user, permissions) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.every(perm => checkPermission(user, perm));
};

export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role;
};

export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === 'admin';
};

export const canAccessPage = (user, page) => {
  if (!user) return false;
  
  // Admin role always has access
  if (user.role === 'admin') return true;
  
  const pagePermissions = {
    '/admin': ['view_dashboard'],
    '/admin/dashboard': ['view_dashboard', 'view_analytics'],
    '/admin/orders': ['view_orders', 'edit_orders', 'delete_orders'],
    '/admin/menu': ['view_menu', 'add_menu', 'edit_menu', 'delete_menu', 'toggle_availability'],
    '/admin/todays-offers': ['view_menu', 'add_menu', 'edit_menu'],
    '/admin/reservations': ['view_reservations', 'edit_reservations', 'delete_reservations'],
    '/admin/gallery': ['view_gallery', 'add_gallery', 'edit_gallery', 'delete_gallery'],
    '/admin/users': ['view_users', 'edit_users', 'delete_users', 'manage_roles'],
    '/admin/coupons': ['view_coupons', 'add_coupons', 'edit_coupons', 'delete_coupons'],
    '/admin/reviews': ['view_reviews', 'edit_reviews', 'delete_reviews'],
    '/admin/hero': ['view_cms', 'edit_hero'],
    '/admin/about': ['view_cms', 'edit_about'],
    '/admin/features': ['view_cms', 'edit_features'],
    '/admin/team': ['view_cms', 'edit_team'],
    '/admin/contact-info': ['view_cms', 'edit_contact'],
    '/admin/contact-messages': ['view_cms', 'edit_contact'],
    '/admin/site-settings': ['view_cms', 'edit_settings'],
    '/admin/seo': ['view_cms', 'edit_seo'],
    '/admin/roles': ['manage_roles']
  };
  
  const requiredPerms = pagePermissions[page];
  if (!requiredPerms) return true; // No specific permissions required
  
  return checkAnyPermission(user, requiredPerms);
};

export const filterMenuByPermissions = (user) => {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', permission: 'view_dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', permission: 'view_orders', icon: '🛍️' },
    { path: '/admin/menu', label: 'Menu', permission: 'view_menu', icon: '🍽️' },
    { path: '/admin/todays-offers', label: "Today's Offers", permission: 'view_menu', icon: '🎁' },
    { path: '/admin/reservations', label: 'Reservations', permission: 'view_reservations', icon: '📅' },
    { path: '/admin/gallery', label: 'Gallery', permission: 'view_gallery', icon: '🖼️' },
    { path: '/admin/users', label: 'Users', permission: 'view_users', icon: '👥' },
    { path: '/admin/coupons', label: 'Coupons', permission: 'view_coupons', icon: '🎟️' },
    { path: '/admin/reviews', label: 'Reviews', permission: 'view_reviews', icon: '⭐' },
    { path: '/admin/contact-messages', label: 'Contact Messages', permission: 'edit_contact', icon: '📧' },
    { path: '/admin/roles', label: 'Roles & Permissions', permission: 'manage_roles', icon: '🔐' },
    { 
      label: 'CMS Content', 
      icon: '🎨',
      submenu: [
        { path: '/admin/hero', label: 'Hero Section', permission: 'edit_hero' },
        { path: '/admin/about', label: 'About Section', permission: 'edit_about' },
        { path: '/admin/features', label: 'Features', permission: 'edit_features' },
        { path: '/admin/team', label: 'Team Members', permission: 'edit_team' },
        { path: '/admin/contact-info', label: 'Contact Info', permission: 'edit_contact' },
        { path: '/admin/site-settings', label: 'Site Settings', permission: 'edit_settings' },
        { path: '/admin/seo', label: 'SEO Settings', permission: 'edit_seo' }
      ]
    }
  ];
  
  return menuItems.filter(item => {
    if (item.submenu) {
      // Filter submenu items
      item.submenu = item.submenu.filter(subItem => 
        checkPermission(user, subItem.permission)
      );
      return item.submenu.length > 0;
    }
    return checkPermission(user, item.permission);
  });
};
