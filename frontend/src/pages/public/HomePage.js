import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCoffee, FiAward, FiHeart, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import Avatar from '../../components/Avatar';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';

const HomePage = () => {
  const [hero, setHero] = useState(null);
  const [features, setFeatures] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [todaysOffers, setTodaysOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [heroRes, featuresRes, menuRes, reviewsRes, offersRes] = await Promise.all([
        api.get('/hero'),
        api.get('/features/all'),
        api.get('/menu'),
        api.get('/reviews'),
        api.get('/todays-offers').catch(() => ({ data: [] }))
      ]);
      
      setHero(heroRes.data);
      setFeatures(featuresRes.data.filter(f => f.isActive).slice(0, 3));
      
      // Get menu items marked for homepage display
      const items = menuRes.data.data?.items || menuRes.data.data || [];
      const homepageItems = items.filter(item => item.showOnHomepage && item.isAvailable).slice(0, 6);
      setMenuItems(homepageItems);
      
      // Get reviews marked for homepage display
      const allReviews = reviewsRes.data.data?.reviews || reviewsRes.data.data || [];
      const homepageReviews = allReviews.filter(r => r.showOnHomepage && r.isPublished).slice(0, 6);
      setReviews(homepageReviews);
      
      // Get today's offers
      const offers = offersRes.data?.data || offersRes.data || [];
      setTodaysOffers(Array.isArray(offers) ? offers.filter(o => o.isActive) : []);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconEmoji) => {
    if (iconEmoji === '☕') return <FiCoffee className="w-12 h-12" />;
    if (iconEmoji === '🏆') return <FiAward className="w-12 h-12" />;
    if (iconEmoji === '❤️') return <FiHeart className="w-12 h-12" />;
    return <FiCoffee className="w-12 h-12" />;
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchContent(); // Refresh content after edit
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section - DYNAMIC */}
      {hero && hero.isActive && (
        <EditableWrapper onEdit={() => handleEdit('hero', hero)} type="hero">
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-brown-500 to-brown-600 text-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${hero.backgroundImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200'})` }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-shadow-lg">
              {hero.title || 'Welcome to Lumière'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
              {hero.subtitle || 'Where every cup tells a story and every bite is a journey to culinary excellence'}
            </p>
            {hero.description && (
              <p className="text-lg mb-8 text-gray-200 max-w-xl mx-auto">
                {hero.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hero.primaryButtonText && (
                <Link to={hero.primaryButtonLink || '/menu'} className="btn-primary bg-primary-500 hover:bg-primary-600">
                  {hero.primaryButtonText}
                </Link>
              )}
              {hero.secondaryButtonText && (
                <Link to={hero.secondaryButtonLink || '/reservations'} className="btn-outline border-white text-white hover:bg-white hover:text-brown-500">
                  {hero.secondaryButtonText}
                </Link>
              )}
            </div>
          </motion.div>
        </section>
        </EditableWrapper>
      )}

      {/* Features Section - DYNAMIC */}
      {features.length > 0 && (
        <section className="section-padding bg-primary-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-serif font-bold mb-4">Why Choose Lumière</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the perfect blend of tradition and innovation in every aspect of our service
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <EditableWrapper 
                  key={feature._id || feature.id}
                  onEdit={() => handleEdit('feature', feature)} 
                  type="feature"
                >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-primary-500 mb-4 flex justify-center">
                    {getIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
                </EditableWrapper>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Items - DYNAMIC */}
      {menuItems.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Main Content - Menu Items */}
              <div className="lg:col-span-3">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Customer Favorites</h2>
                  <p className="text-gray-600 dark:text-gray-400">Try our most loved items</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {menuItems.map((item, index) => (
                    <EditableWrapper 
                      key={item._id || item.id}
                      onEdit={() => handleEdit('menu-item', item)} 
                      type="menu-item"
                    >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="card group cursor-pointer hover:shadow-2xl transition-all"
                    >
                      <div className="relative overflow-hidden h-48 md:h-64">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600">
                            <Avatar name={item.name} size="2xl" shape="square" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-2">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">₹{Math.round(parseFloat(item.price))}</span>
                          <button className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                            <FiArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    </EditableWrapper>
                  ))}
                </div>

                <div className="text-center mt-8 md:mt-12">
                  <Link to="/menu" className="btn-primary inline-block">
                    View Full Menu
                  </Link>
                </div>
              </div>

              {/* Sidebar - Today's Offers */}
              {todaysOffers.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-6 border-2 border-primary-200 dark:border-primary-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300">Today's Offers</h3>
                        <span className="text-3xl">🎉</span>
                      </div>
                      
                      <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-primary-50 dark:scrollbar-thumb-primary-600 dark:scrollbar-track-gray-700 pr-2">
                        {todaysOffers.map((offer, index) => (
                          <EditableWrapper 
                            key={offer._id || offer.id || index}
                            onEdit={() => handleEdit('todays-offer', offer)} 
                            type="todays-offer"
                          >
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-primary-100 dark:border-gray-600"
                          >
                            {offer.image ? (
                              <img
                                src={offer.image}
                                alt={offer.title}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3">
                                <Avatar name={offer.title} size="xl" shape="square" />
                              </div>
                            )}
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{offer.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{offer.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {offer.discount || '20% OFF'}
                              </span>
                              {offer.validUntil && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Valid till {new Date(offer.validUntil).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </motion.div>
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

      {/* CTA Section */}
      <section className="section-padding bg-brown-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Experience Lumière?
          </h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience. Reserve your table today!
          </p>
          <Link to="/reservations" className="btn-primary bg-primary-500 hover:bg-primary-600">
            Make a Reservation
          </Link>
        </div>
      </section>

      {/* Reviews Section - DYNAMIC */}
      {reviews.length > 0 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <h2 className="text-4xl font-serif font-bold text-center mb-12 text-gray-900 dark:text-gray-100">What Our Guests Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <EditableWrapper
                  key={review._id || review.id}
                  onEdit={() => handleEdit('review', review)}
                >
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <Avatar 
                        src={review.user?.avatar}
                        name={review.user?.name || review.userName || 'Customer'}
                        size="md"
                        className="mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{review.user?.name || review.userName || 'Customer'}</h4>
                        <div className="text-yellow-400">
                          {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">{review.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      "{review.comment || review.review}"
                    </p>
                    {review.isVerifiedPurchase && (
                      <div className="mt-3 flex items-center text-green-600 dark:text-green-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Purchase
                      </div>
                    )}
                    {review.adminResponse && (
                      <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-3 rounded-r">
                        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">Response from Lumière Café:</p>
                        <p className="text-sm text-primary-600 dark:text-primary-400">{review.adminResponse.response}</p>
                      </div>
                    )}
                  </div>
                </EditableWrapper>
              ))}
            </div>
          </div>
        </section>
      )}

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
