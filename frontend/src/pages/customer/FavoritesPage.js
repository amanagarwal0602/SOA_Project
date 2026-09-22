import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data.data);
    } catch (error) {
      console.error('Failed to load favorites');
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`✓ ${item.name} added to cart!`, { autoClose: 2000 });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map(item => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <img src={item.image || 'https://via.placeholder.com/400'} alt={item.name} loading="lazy" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{item.name}</h3>
                <p className="text-primary-600 font-bold mb-4">${item.price.toFixed(2)}</p>
                <button onClick={() => handleAddToCart(item)} className="btn-primary w-full">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

