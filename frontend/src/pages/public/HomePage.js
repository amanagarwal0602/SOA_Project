import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCoffee, FiAward, FiHeart, FiArrowRight, FiTruck, FiShoppingCart } from 'react-icons/fi';
import api from '../../services/api';
import Avatar from '../../components/Avatar';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { formatSafeDate } from '../../utils/dateUtils';

const HomePage = () => {
  const { addToCart } = useCart();
  const [hero, setHero] = useState(null);
  const [features, setFeatures] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [todaysOffers, setTodaysOffers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [heroRes, featuresRes, menuRes, reviewsRes, offersRes, favRes] = await Promise.all([
        api.get('/hero').catch(() => ({ data: {} })),
        api.get('/features/all').catch(() => api.get('/features')).catch(() => ({ data: [] })),
        api.get('/menu').catch(() => ({ data: { data: [] } })),
        api.get('/reviews').catch(() => ({ data: { data: [] } })),
        api.get('/todays-offers').catch(() => ({ data: [] })),
        api.get('/users/favorites').catch(() => ({ data: { data: [] } }))
      ]);
      
      setHero(heroRes.data);
      const feats = Array.isArray(featuresRes.data) ? featuresRes.data : (featuresRes.data?.data || []);
      setFeatures(feats.filter(f => f.isActive !== false).slice(0, 3));
      
      // Get menu items marked by admin for homepage display
      const items = menuRes.data?.data?.items || menuRes.data?.data || [];
      const homepageItems = items.filter(item => (item.showOnHomepage === true || item.show_on_homepage === true) && (item.isAvailable !== false && item.is_available !== false));
      setMenuItems(homepageItems.length > 0 ? homepageItems : items.slice(0, 6));
      
      // Get reviews marked by admin for homepage display
      const allReviews = reviewsRes.data?.data?.reviews || reviewsRes.data?.data || [];
      const homepageReviews = allReviews.filter(r => (r.showOnHomepage === true || r.show_on_homepage === true) && (r.isPublished !== false && r.is_published !== false));
      setReviews(homepageReviews);
      
      // Get today's offers
      const offers = offersRes.data?.data || offersRes.data || [];
      setTodaysOffers(Array.isArray(offers) ? offers.filter(o => o.isActive !== false && o.is_active !== false) : []);

      // Get favorites
      const favItems = favRes.data?.data || [];
      const favIds = Array.isArray(favItems) ? favItems.map(f => f.id || f._id) : [];
      setFavorites(favIds);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = item._id || item.id;
    const isFav = favorites.includes(itemId);
    try {
      if (isFav) {
        await api.delete(`/users/favorites/${itemId}`);
        setFavorites(prev => prev.filter(id => id !== itemId));
        toast.info(`Removed ${item.name} from favorites`);
      } else {
        await api.post(`/users/favorites/${itemId}`);
        setFavorites(prev => [...prev, itemId]);
        toast.success(`✓ Added ${item.name} to favorites!`, { autoClose: 2000 });
      }
    } catch (err) {
      // Local storage fallback for guests
      const cur = JSON.parse(localStorage.getItem('fav_items') || '[]');
      if (cur.includes(itemId)) {
        const next = cur.filter(id => id !== itemId);
        localStorage.setItem('fav_items', JSON.stringify(next));
        setFavorites(next);
        toast.info(`Removed ${item.name} from favorites`);
      } else {
        const next = [...cur, itemId];
        localStorage.setItem('fav_items', JSON.stringify(next));
        setFavorites(next);
        toast.success(`✓ Added ${item.name} to favorites!`, { autoClose: 2000 });
      }
    }
  };

  const getIcon = (icon) => {
    if (icon === '☕' || icon === 'FiCoffee') return <FiCoffee className="w-12 h-12" />;
    if (icon === '🏆' || icon === 'FiAward') return <FiAward className="w-12 h-12" />;
    if (icon === '❤️' || icon === 'FiHeart') return <FiHeart className="w-12 h-12" />;
    if (icon === '🚚' || icon === 'FiTruck') return <FiTruck className="w-12 h-12" />;
    return <FiCoffee className="w-12 h-12" />;
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchContent();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      {hero && hero.isActive !== false && (
        <EditableWrapper onEdit={() => handleEdit('hero', hero)} type="hero">
          <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-r from-brown-500 to-brown-600 text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${hero.backgroundImage || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600'})` }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 text-center px-4 max-w-4xl py-20"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold mb-6 drop-shadow-md">
                {hero.title || 'Welcome to Lumière'}
              </h1>
              <p className="text-lg sm:text-2xl mb-6 text-gray-100 max-w-2xl mx-auto font-light">
                {hero.subtitle || 'Artisanal Coffee & Gourmet Bistro'}
              </p>
              {hero.description && (
                <p className="text-sm sm:text-base mb-8 text-gray-200 max-w-xl mx-auto opacity-90">
                  {hero.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to={hero.primaryButtonLink || hero.ctaLink || '/menu'}
                  className="btn-primary bg-primary-600 hover:bg-primary-700 px-8 py-3.5 text-base font-semibold shadow-lg"
                >
                  {hero.primaryButtonText || hero.ctaText || 'Explore Menu'}
                </Link>
                <Link
                  to={hero.secondaryButtonLink || hero.secondaryCtaLink || '/reservations'}
                  className="px-8 py-3.5 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold text-base shadow-lg"
                >
                  {hero.secondaryButtonText || hero.secondaryCtaText || 'Book a Table'}
                </Link>
              </div>
            </motion.div>
          </section>
        </EditableWrapper>
      )}

      {/* Features Section */}
      {features.length > 0 && (
        <section className="section-padding bg-primary-50 dark:bg-gray-800/50 py-16">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 dark:text-gray-100">Why Choose Lumière</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience the perfect blend of tradition and innovation in every dish and brew
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <EditableWrapper 
                  key={feature._id || feature.id || index}
                  onEdit={() => handleEdit('feature', feature)} 
                  type="feature"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
                  >
                    <div className="text-primary-500 mb-4 flex justify-center">
                      {getIcon(feature.icon)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                </EditableWrapper>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Items */}
      {menuItems.length > 0 && (
        <section className="section-padding py-16 dark:bg-gray-900">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content - Menu Items */}
              <div className={todaysOffers.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-gray-100">Customer Favorites</h2>
                  <p className="text-gray-600 dark:text-gray-400">Handcrafted delicacies crafted with passion</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {menuItems.map((item, index) => {
                    const itemId = item._id || item.id;
                    const isFav = favorites.includes(itemId);
                    return (
                      <EditableWrapper 
                        key={itemId || index}
                        onEdit={() => handleEdit('menu-item', item)} 
                        type="menu-item"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.08 }}
                          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
                        >
                          <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-700">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                              }}
                            />
                            {/* Favorite Button */}
                            <button
                              onClick={(e) => toggleFavorite(item, e)}
                              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm shadow transition ${
                                isFav
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:text-rose-500'
                              }`}
                              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <FiHeart size={16} className={isFav ? "fill-white" : ""} />
                            </button>
                            {item.isVeg && (
                              <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded shadow">
                                🌱 Veg
                              </span>
                            )}
                          </div>

                          <div className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
                            </div>
                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wider mb-2">
                              {item.category}
                            </span>
                            {item.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                                {item.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
                              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                ₹{Math.round(parseFloat(item.price))}
                              </span>
                              <button
                                onClick={() => {
                                  addToCart(item);
                                  toast.success(`✓ Added ${item.name} to cart!`, { autoClose: 1500 });
                                }}
                                className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
                              >
                                <FiShoppingCart size={15} />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </EditableWrapper>
                    );
                  })}
                </div>

                <div className="text-center mt-10">
                  <Link to="/menu" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                    <span>View Full Menu</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>

              {/* Sidebar - Today's Offers */}
              {todaysOffers.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-amber-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Today's Specials</h3>
                        <span className="text-2xl">🎉</span>
                      </div>
                      
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {todaysOffers.map((offer, index) => (
                          <EditableWrapper 
                            key={offer._id || offer.id || index}
                            onEdit={() => handleEdit('todays-offer', offer)} 
                            type="todays-offer"
                          >
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-600">
                              {offer.image && (
                                <img
                                  src={offer.image}
                                  alt={offer.title}
                                  className="w-full h-28 object-cover rounded-lg mb-2"
                                />
                              )}
                              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">{offer.title}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{offer.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="bg-primary-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                                  {offer.discount || 'Special'}
                                </span>
                                {(offer.validUntil || offer.valid_until) && (
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Till {formatSafeDate(offer.validUntil || offer.valid_until, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </EditableWrapper>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-800/60 py-16">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-3 text-gray-900 dark:text-gray-100">Guest Reviews</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">What patrons love about our culinary experience</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <EditableWrapper
                  key={review._id || review.id}
                  onEdit={() => handleEdit('review', review)}
                >
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center mb-4">
                        <Avatar 
                          src={review.user?.avatar || review.userAvatar}
                          name={review.user?.name || review.userName || 'Guest'}
                          size="md"
                          className="mr-3"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{review.user?.name || review.userName || 'Guest'}</h4>
                          <div className="text-yellow-400 text-xs">
                            {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                          </div>
                        </div>
                      </div>
                      {review.title && <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-1">{review.title}</p>}
                      <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                        "{review.comment || review.review}"
                      </p>
                    </div>

                    {review.adminResponse && (
                      <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-2.5 rounded-r">
                        <p className="text-xs font-bold text-primary-700 dark:text-primary-300">Response from Lumière:</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{review.adminResponse.response}</p>
                      </div>
                    )}
                  </div>
                </EditableWrapper>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-brown-500 to-brown-600 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 drop-shadow">
            Ready to Experience Lumière?
          </h2>
          <p className="text-lg mb-8 text-gray-200 max-w-xl mx-auto">
            Reserve your table or order online for fast, piping hot delivery
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/reservations" className="btn-primary bg-primary-600 hover:bg-primary-700 px-8 py-3 font-semibold shadow-lg">
              Make a Reservation
            </Link>
            <Link to="/menu" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold shadow-lg">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>

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

export default HomePage;
