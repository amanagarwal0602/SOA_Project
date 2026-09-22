import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiFilter, FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vegOnly, setVegOnly] = useState(false); // single veg-only toggle
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      const items = response.data.data?.items || response.data.data || response.data || [];
      setMenuItems(items);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/menu');
      const items = response.data.data?.items || response.data.data || response.data || [];
      const uniqueCategories = [...new Set(items.map(item => item.category))].filter(Boolean);
      setCategories(['all', ...uniqueCategories]);
    } catch (error) {
      console.error('Failed to load categories');
      setCategories(['all']);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(i => (i._id || i.id) === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncrement = (item) => {
    const quantity = getItemQuantity(item._id || item.id);
    if (quantity > 0) {
      updateQuantity(item._id || item.id, quantity + 1);
    } else {
      addToCart(item);
    }
  };

  const handleDecrement = (item) => {
    const quantity = getItemQuantity(item._id || item.id);
    if (quantity > 1) {
      updateQuantity(item._id || item.id, quantity - 1);
    } else if (quantity === 1) {
      removeFromCart(item._id || item.id);
    }
  };

  // Filter by search and category
  const getFilteredItems = () => {
    let filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Veg Only toggle
    if (vegOnly) {
      filtered = filtered.filter(item => item.is_veg === true || item.isVeg === true);
    }

    return filtered;
  };

  // Group items by category for "All" view
  const getGroupedItems = () => {
    const filtered = getFilteredItems();
    const grouped = {};
    
    filtered.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  };

  const filteredItems = getFilteredItems();
  const groupedItems = selectedCategory === 'all' ? getGroupedItems() : null;

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchMenuItems(); // Refresh menu items after edit
  };

  const renderMenuItem = (item, index) => (
    <EditableWrapper 
      onEdit={() => handleEdit('menu-item', item)} 
      type="menu-item"
    >
    <motion.div
      key={item.id || item._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card hover:shadow-xl transition-shadow"
    >
      <div className="h-48 overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={item.image || item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
          }}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <span className="text-xs text-gray-500 uppercase">{item.category}</span>
          </div>
          <span className="text-xl font-bold text-primary-600">₹{Math.round(parseFloat(item.price))}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {(item.is_veg || item.isVeg) && (
          <div className="flex gap-2 mb-4">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              🌱 Vegetarian
            </span>
          </div>
        )}
        
        {item.rating && (
          <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
            <span className="text-yellow-500">★</span>
            <span>{parseFloat(item.rating).toFixed(1)}</span>
            {item.rating_count && <span className="text-gray-400">({item.rating_count})</span>}
          </div>
        )}
        
        {(item.is_available !== false && item.isAvailable !== false) ? (
          getItemQuantity(item._id || item.id) > 0 ? (
            <div className="flex items-center justify-between bg-primary-600 text-white rounded-lg p-3">
              <button
                onClick={() => handleDecrement(item)}
                className="hover:bg-primary-700 rounded-full p-1 transition"
              >
                <FiMinus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg">{getItemQuantity(item._id || item.id)}</span>
              <button
                onClick={() => handleIncrement(item)}
                className="hover:bg-primary-700 rounded-full p-1 transition"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(item)}
              className="w-full btn-primary"
            >
              Add to Cart
            </button>
          )
        ) : (
          <button disabled className="w-full btn-primary opacity-50 cursor-not-allowed">
            Not Available
          </button>
        )}
      </div>
    </motion.div>
    </EditableWrapper>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-brown-600 to-brown-500 dark:from-gray-800 dark:to-gray-700 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Our Menu</h1>
          <p className="text-xl text-gray-200">Discover our carefully curated selection</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-xl text-gray-600 dark:text-gray-400">Loading menu...</div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl font-serif font-bold mb-4 text-gray-800 dark:text-gray-200">No Menu Items Yet</div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Check back soon for our delicious offerings!</p>
          </div>
        ) : (
          <>
        {/* Search, Category, Veg Only Toggle */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
          <div className="w-full md:flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Veg Only Toggle - Professional Side Position */}
          <label className="flex items-center gap-3 cursor-pointer select-none bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600 transition-all shadow-sm hover:shadow-md">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={e => setVegOnly(e.target.checked)}
              className="form-checkbox h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className={`font-medium whitespace-nowrap ${vegOnly ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
              {vegOnly ? '🌱 Veg Only' : 'Veg Only'}
            </span>
          </label>
        </div>
        
        <div className="w-full overflow-x-auto pb-4 mb-6">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {category === 'all' ? '🍽️ All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Display - Section-wise or Grid */}
        {selectedCategory === 'all' ? (
          // Section-wise display for "All"
          <div className="space-y-12">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found</p>
              </div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-serif font-bold text-gray-800">{category}</h2>
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500 text-sm">{items.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                      <div key={item.id || item._id}>
                        {renderMenuItem(item, index)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Regular grid for specific category
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </h2>
              <p className="text-gray-600">{filteredItems.length} items available</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <div key={item.id || item._id}>
                  {renderMenuItem(item, index)}
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found</p>
              </div>
            )}
          </>
        )}
        </>
      )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </div>
  );
};

export default MenuPage;
