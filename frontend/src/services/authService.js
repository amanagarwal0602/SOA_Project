// localStorage Authentication Service
import * as db from './localStorage';

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      // Check if username already exists
      if (userData.username) {
        const users = await db.getUsers();
        const usernameExists = users.some(u => u.username === userData.username);
        if (usernameExists) {
          throw new Error('Username already taken');
        }
      }

      // Check if email already exists
      const users = await db.getUsers();
      const emailExists = users.some(u => u.email === userData.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Create new user
      const newUser = await db.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        username: userData.username || '',
        role: 'customer'
      });

      // Create token
      const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }));
      localStorage.setItem('accessToken', token);

      return {
        data: {
          user: newUser,
          token: token
        },
        success: true
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    console.log('AuthService: Attempting login with:', { emailOrUsername: credentials.email });
    try {
      const loginInput = credentials.email.toLowerCase().trim();
      const password = credentials.password;

      // HARDCODED ADMIN LOGIN - Always works
      if ((loginInput === 'admin@admin.com' || loginInput === 'admin') && password === 'admin') {
        const adminUser = {
          id: 'admin000',
          table_type: 'user',
          name: 'Admin',
          email: 'admin@admin.com',
          username: 'admin',
          password: 'admin',
          phone: '+91-98765-43211',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          address_street: '123 Admin Avenue',
          address_city: 'Mumbai',
          address_state: 'Maharashtra',
          address_zipcode: '400001',
          address_country: 'India',
          favorite_items: [],
          permissions: ['all'],
          refresh_token: '',
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = btoa(JSON.stringify({ userId: adminUser.id, email: adminUser.email }));
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        console.log('AuthService: Hardcoded Admin login successful');
        return {
          data: { user: adminUser, token: token },
          success: true
        };
      }

      // HARDCODED DEMO LOGIN - Always works
      if ((loginInput === 'demo@demo.com' || loginInput === 'demo') && password === 'demo') {
        const demoUser = {
          id: 'demo001',
          table_type: 'user',
          name: 'Demo User',
          email: 'demo@demo.com',
          username: 'demo',
          password: 'demo',
          phone: '+91-98765-43210',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          address_street: '456 Demo Street',
          address_city: 'Mumbai',
          address_state: 'Maharashtra',
          address_zipcode: '400001',
          address_country: 'India',
          favorite_items: [],
          permissions: ['view_dashboard', 'view_orders', 'view_menu', 'view_reservations'],
          refresh_token: '',
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = btoa(JSON.stringify({ userId: demoUser.id, email: demoUser.email }));
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('AuthService: Hardcoded Demo login successful');
        return {
          data: { user: demoUser, token: token },
          success: true
        };
      }

      // Check database for other users
      const users = await db.getUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === loginInput || 
        (u.username && u.username.toLowerCase() === loginInput)
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.password !== credentials.password) {
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        throw new Error('Account is inactive');
      }

      // Create token
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user data for EditMode

      console.log('AuthService: Login successful, user stored:', user.name, user.role);
      return {
        data: {
          user: user,
          token: token
        },
        success: true
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Also remove user data
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return { data: null, success: false };

      const payload = JSON.parse(atob(token));
      const users = await db.getUsers();
      const user = users.find(u => u.id === payload.userId);
      
      return { data: user, success: !!user };
    } catch (error) {
      console.error('Get current user failed:', error);
      return { data: null, success: false };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;
