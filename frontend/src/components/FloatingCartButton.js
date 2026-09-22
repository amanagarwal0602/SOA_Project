import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const FloatingCartButton = () => {
  const { cartItems, getCartTotal, getItemCount } = useCart();
  const location = useLocation();
  const itemCount = getItemCount();
  
  // Don't show on cart, checkout, payment pages or admin pages
  const hiddenPaths = ['/cart', '/checkout', '/payment', '/admin', '/login', '/register'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide || itemCount === 0) return null;

  return (
    <Link to="/cart">
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl flex items-center gap-3 px-5 py-3 transition-all duration-300 hover:scale-105 hover:shadow-primary-500/50 cursor-pointer animate-fade-in-up">
          <div className="relative">
            <FiShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {itemCount}
            </span>
          </div>
          <div className="border-l border-white/30 pl-3">
            <p className="text-xs opacity-90">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            <p className="font-bold text-sm">₹{getCartTotal().toFixed(0)}</p>
          </div>
          <div className="ml-2 bg-white/20 rounded-full p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FloatingCartButton;
