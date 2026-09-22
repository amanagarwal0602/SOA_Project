import { createUser, getUserByEmail, getUserByUsername, updateUser } from './localStorage';
// import { createUser, getUserByEmail, getUserByUsername, updateUser } from './sheetdb'; // Uncomment when SheetDB API key is ready

// Simple client-side auth using SheetDB
const AUTH_STORAGE_KEY = 'lumiere_auth';

const isExplicitlyInactive = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (typeof value === 'boolean') {
    return value === false;
  }
  if (typeof value === 'number') {
    return value === 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ['false', '0', 'inactive', 'no', 'n', 'off'].includes(normalized);
  }
  return false;
};

// Register new user
export const register = async (name, email, password, username = '') => {
  try {
    // Check if email exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if username exists (if provided)
    if (username) {
      const existingUsername = await getUserByUsername(username);
      if (existingUsername) {
        throw new Error('Username already taken');
      }
    }

    // Create user (plain text password for simplicity)
    const userData = {
      name,
      username,
      email,
      password: password,
      role: 'customer'
    };

    const result = await createUser(userData);
    
    // Create auth token
    const token = btoa(JSON.stringify({
      id: result.id,
      email: email,
      username: username,
      role: 'customer',
      timestamp: Date.now()
    }));

    // Store auth data
    const authData = {
      token,
      user: {
        id: result.id,
        name: name,
        username: username,
        email: email,
        role: 'customer',
        avatar: '',
        phone: ''
      }
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    
    return {
      success: true,
      message: 'Registration successful',
      token: token,
      user: authData.user
    };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Login user
export const login = async (emailOrUsername, password) => {
  try {
    // Hardcoded demo accounts - support both username and email
    if ((emailOrUsername === 'demo' || emailOrUsername === 'demo@lumierecafe.com') && password === 'demo') {
      const demoUser = {
        id: 'demo001',
        name: 'Demo User',
        username: 'demo',
        email: 'demo@lumierecafe.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        phone: '+1-555-0000',
        is_active: true
      };
      
      const token = btoa(JSON.stringify({
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.username,
        role: demoUser.role,
        timestamp: Date.now()
      }));
      
      const authData = {
        token,
        user: demoUser
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      return {
        success: true,
        token,
        user: demoUser
      };
    }
    
    if ((emailOrUsername === 'admin' || emailOrUsername === 'admin@lumierecafe.com') && password === 'admin') {
      const adminUser = {
        id: 'admin001',
        name: 'Admin User',
        username: 'admin',
        email: 'admin@lumierecafe.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        phone: '+1-555-0100',
        is_active: true
      };
      
      const token = btoa(JSON.stringify({
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        timestamp: Date.now()
      }));
      
      const authData = {
        token,
        user: adminUser
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      return {
        success: true,
        token,
        user: adminUser
      };
    }
    
    // Determine if input is email or username
    const isEmail = emailOrUsername.includes('@');
    let user = null;
    
    if (isEmail) {
      // Login with email
      user = await getUserByEmail(emailOrUsername);
    } else {
      // Login with username
      user = await getUserByUsername(emailOrUsername);
    }
    
    if (!user) {
      throw new Error('Invalid username/email or password');
    }

    // Verify password (plain text comparison)
    const isValidPassword = password === user.password;
    
    if (!isValidPassword) {
      throw new Error('Invalid username/email or password');
    }

    // Treat blank/missing values as active, only block when explicitly inactive
    if (isExplicitlyInactive(user.is_active)) {
      throw new Error('Account is inactive');
    }

    // Create auth token (simple client-side token)
    const token = btoa(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      timestamp: Date.now()
    }));

    // Store auth data
    const authData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    return {
      success: true,
      token,
      user: authData.user
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = '/login';
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return null;

  try {
    const parsed = JSON.parse(authData);
    return parsed.user;
  } catch {
    return null;
  }
};

// Get auth token
export const getToken = () => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return null;

  try {
    const parsed = JSON.parse(authData);
    return parsed.token;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  try {
    await updateUser(userId, updates);

    // Update localStorage
    const authData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (authData && authData.user.id === userId) {
      authData.user = { ...authData.user, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    }

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    throw new Error(error.message || 'Profile update failed');
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  hasRole,
  updateProfile
};
