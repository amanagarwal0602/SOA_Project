import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiPackage, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import EditableWrapper from '../EditableWrapper';
import EditModal from '../EditModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isStaff } = useAuth();
  const { getItemCount } = useCart();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    setEditModal({ isOpen: false, type: '', data: null });
    window.location.reload(); // Reload to fetch updated settings
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
    { name: 'Reserve', path: '/reservations' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <EditableWrapper
            onEdit={() => handleEdit('logo', { siteName: settings.siteName, logo: settings.logo })}
          >
            <Link to="/" className="flex items-center space-x-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.siteName} 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="text-3xl font-serif font-bold text-primary-500 dark:text-primary-400">
                    {settings.siteName.replace(' Café', '').replace(' Cafe', '')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">CAFÉ</span>
                </>
              )}
            </Link>
          </EditableWrapper>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* My Orders - Always visible for logged in users */}
            {user && (
              <Link 
                to="/customer/orders" 
                className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
              >
                <FiPackage className="w-5 h-5" />
                <span className="text-sm font-medium">My Orders</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <FiShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
                  <FiUser className="w-6 h-6" />
                  <span className="hidden md:block">{user.name}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    {isStaff && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/customer"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/customer/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/customer/orders"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block btn-primary"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-700"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="container-custom py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-gray-700 hover:text-primary-500"
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/customer/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 py-2 text-primary-600 font-medium"
                >
                  <FiPackage className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
              )}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-primary-500 font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </nav>
  );
};

export default Navbar;
