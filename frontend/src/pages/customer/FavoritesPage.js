import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FiHeart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/favorites');
      const data = response.data?.data || response.data || [];
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      // Fallback to localStorage if any
      const local = JSON.parse(localStorage.getItem('user_favorites') || '[]');
      setFavorites(local);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`✓ ${item.name} added to cart!`, { autoClose: 2000 });
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await api.delete(`/users/favorites/${itemId}`);
      setFavorites(prev => prev.filter(f => (f.id || f._id) !== itemId));
      
      const local = JSON.parse(localStorage.getItem('user_favorites') || '[]');
      const updated = local.filter(id => id !== itemId && id !== String(itemId));
      localStorage.setItem('user_favorites', JSON.stringify(updated));
      
      toast.info('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      setFavorites(prev => prev.filter(f => (f.id || f._id) !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <FiHeart className="text-red-500 fill-red-500" />
              My Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your handpicked culinary favorites at Lumière
            </p>
          </div>
          <Link
            to="/menu"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-medium transition"
          >
            Browse Menu <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart size={36} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
              No favorites saved yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Browse our artisan menu and tap the heart icon on any dish to save it here for fast reordering.
            </p>
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingBag /> Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(item => {
              const itemId = item.id || item._id;
              const imageUrl = item.image || item.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500';
              const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;

              return (
                <div
                  key={itemId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <button
                      onClick={() => handleRemoveFavorite(itemId)}
                      aria-label="Remove from favorites"
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full shadow transition"
                      title="Remove from favorites"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    {item.category && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-md">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-gray-100">
                          {item.name}
                        </h3>
                        {(item.isVeg || item.is_veg) && (
                          <span className="text-green-600 text-sm font-semibold" title="Vegetarian">
                            🌱 Veg
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                        {item.description || 'Artisan handcrafted dish made fresh to order.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{Math.round(price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                      >
                        <FiShoppingBag size={16} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
