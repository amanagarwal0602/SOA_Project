import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiCalendar, FiUser, FiSettings, FiBox, FiImage, FiStar, FiUsers, FiTag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { checkPermission } from '../../utils/permissions';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const customerLinks = [
    { icon: <FiUser />, title: 'My Profile', path: '/customer/profile', color: 'bg-slate-600' },
    { icon: <FiShoppingBag />, title: 'My Orders', path: '/customer/orders', color: 'bg-teal-600' },
    { icon: <FiCalendar />, title: 'Reservations', path: '/customer/reservations', color: 'bg-cyan-600' },
    { icon: <FiHeart />, title: 'Favorites', path: '/customer/favorites', color: 'bg-rose-600' },
  ];

  // Admin menu items based on permissions
  const adminLinks = [
    { icon: <FiSettings />, title: 'Admin Dashboard', path: '/admin', color: 'bg-indigo-500', permission: 'view_dashboard' },
    { icon: <FiShoppingBag />, title: 'Manage Orders', path: '/admin/orders', color: 'bg-orange-500', permission: 'view_orders' },
    { icon: <FiBox />, title: 'Menu Management', path: '/admin/menu', color: 'bg-teal-500', permission: 'view_menu' },
    { icon: <FiCalendar />, title: 'Reservations', path: '/admin/reservations', color: 'bg-cyan-500', permission: 'view_reservations' },
    { icon: <FiImage />, title: 'Gallery', path: '/admin/gallery', color: 'bg-pink-500', permission: 'view_gallery' },
    { icon: <FiStar />, title: 'Reviews', path: '/admin/reviews', color: 'bg-yellow-500', permission: 'view_reviews' },
    { icon: <FiUsers />, title: 'Users', path: '/admin/users', color: 'bg-violet-500', permission: 'view_users' },
    { icon: <FiTag />, title: 'Coupons', path: '/admin/coupons', color: 'bg-emerald-500', permission: 'view_coupons' },
  ];

  // Filter admin links based on user permissions
  const availableAdminLinks = adminLinks.filter(link => 
    checkPermission(user, link.permission)
  );

  const quickLinks = [...customerLinks, ...availableAdminLinks];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-serif font-bold mb-3 text-white drop-shadow-lg">Welcome back, {user?.name}!</h1>
            <p className="text-slate-100 text-lg">
              {availableAdminLinks.length > 0 
                ? `Manage your account and ${user?.role === 'admin' ? 'admin' : 'assigned'} features`
                : 'Manage your account and orders'
              }
            </p>
            {availableAdminLinks.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-white">Access to {availableAdminLinks.length} admin feature{availableAdminLinks.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Customer Section */}
        {customerLinks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">My Account</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {customerLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-transparent"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-800 dark:to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className={`${link.color} w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      {link.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your {link.title.toLowerCase()}</p>
                    <div className="mt-4 flex items-center text-teal-600 dark:text-teal-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {availableAdminLinks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Admin Tools</h2>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{availableAdminLinks.length} available</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableAdminLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-transparent"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-900/10 dark:to-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className={`${link.color} w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      {link.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Admin access</p>
                    <div className="mt-4 flex items-center text-amber-600 dark:text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Manage</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Info Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900/10 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">You have no recent orders</p>
            <Link to="/customer/orders" className="inline-flex items-center gap-2 mt-4 text-teal-600 dark:text-teal-400 font-semibold hover:gap-3 transition-all">
              <span>View all orders</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/10 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Upcoming Reservations</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">No upcoming reservations</p>
            <Link to="/customer/reservations" className="inline-flex items-center gap-2 mt-4 text-cyan-600 dark:text-cyan-400 font-semibold hover:gap-3 transition-all">
              <span>View all reservations</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

