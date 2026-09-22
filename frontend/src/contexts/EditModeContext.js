import React, { createContext, useContext, useState, useEffect } from 'react';

const EditModeContext = createContext();

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
};

export const EditModeProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(null);

  // Function to update user from localStorage
  const updateUserFromStorage = () => {
    console.log('🔄 EditModeContext: Updating user from storage...');
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    console.log('🔑 Token exists:', !!token);
    console.log('👤 User data exists:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ EditMode: User loaded successfully:', parsedUser.name, '- Role:', parsedUser.role);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        setUser(null);
      }
    } else {
      console.log('⚠️ No token or user data found');
      setUser(null);
      setIsEditMode(false);
    }
  };

  useEffect(() => {
    console.log('🚀 EditModeContext: Initial mount');
    // Initial load
    updateUserFromStorage();

    // Listen for custom login event
    const handleLogin = () => {
      console.log('📢 EditMode: Login event detected');
      updateUserFromStorage();
    };

    // Listen for storage changes (cross-tab)
    const handleStorageChange = () => {
      console.log('📢 EditMode: Storage change detected');
      updateUserFromStorage();
    };

    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleEditMode = () => {
    // Only admin and staff can enable edit mode
    if (user && (user.role === 'admin' || user.role === 'staff')) {
      setIsEditMode(!isEditMode);
      
      // Store edit mode state in sessionStorage
      sessionStorage.setItem('editModeEnabled', (!isEditMode).toString());
      
      // Show notification
      if (!isEditMode) {
        console.log('✏️ Edit Mode Enabled - Click on elements to edit them');
      } else {
        console.log('👁️ Edit Mode Disabled - Normal viewing mode');
      }
    }
  };

  const canEdit = () => {
    return user && (user.role === 'admin' || user.role === 'staff') && isEditMode;
  };

  // Restore edit mode state from sessionStorage on mount
  useEffect(() => {
    const savedEditMode = sessionStorage.getItem('editModeEnabled');
    if (savedEditMode === 'true' && user && (user.role === 'admin' || user.role === 'staff')) {
      setIsEditMode(true);
    }
  }, [user]);

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      toggleEditMode, 
      canEdit,
      user 
    }}>
      {children}
    </EditModeContext.Provider>
  );
};
