// LocalStorage API - Temporary replacement for SheetDB
// Switch back to SheetDB by changing the import below
import * as db from './localStorage';
// import * as db from './sheetdb'; // Uncomment this when SheetDB API key is ready

// Compatibility layer for existing code using axios-style API
const api = {
  get: async (url, config = {}) => {
    try {
      const parts = url.replace('/api/', '').split('/').filter(Boolean);
      
      // Menu endpoints
      if (parts[0] === 'menu') {
        if (parts[1] === 'categories' && parts[2] === 'list') {
          const items = await db.getMenuItems();
          const uniqueCategories = [...new Set(items.map(item => item.category))];
          return { data: { data: uniqueCategories.map(cat => ({ category: cat })) } };
        }
        const items = await db.getMenuItems();
        const category = config.params?.category;
        const filtered = category ? items.filter(item => item.category === category) : items;
        return { data: { data: { items: filtered } } };
      }
      
      if (parts[0] === 'orders') return { data: { data: await db.getOrders() } };
      if (parts[0] === 'admin' && parts[1] === 'orders') return { data: { data: await db.getOrders() } };
      if (parts[0] === 'admin' && parts[1] === 'users') return { data: { data: { users: await db.getUsers() } } };
      if (parts[0] === 'admin' && parts[1] === 'reviews') return { data: { data: await db.getReviews() } };
      if (parts[0] === 'reservations') return { data: { data: await db.getReservations() } };
      if (parts[0] === 'admin' && parts[1] === 'reservations') return { data: { data: await db.getReservations() } };
      if (parts[0] === 'coupons') return { data: { data: await db.getCoupons() } };
      if (parts[0] === 'gallery') return { data: { data: await db.getGalleryImages() } };
      if (parts[0] === 'reviews') return { data: { data: { reviews: await db.getReviews() } } };
      if (parts[0] === 'users') return { data: { data: { users: await db.getUsers() } } };
      if (parts[0] === 'features') return { data: await db.getFeatures() };
      if (parts[0] === 'team') {
        if (parts[1] === 'all') return { data: await db.getTeamMembers() };
        return { data: await db.getTeamMembers() };
      }
      if (parts[0] === 'hero') return { data: await db.getAboutContent() };
      if (parts[0] === 'about') return { data: await db.getAboutContent() };
      if (parts[0] === 'contact-info') {
        if (parts[1] === 'messages') return { data: { data: { messages: await db.getContactMessages() } } };
        return { data: await db.getContactInfo() };
      }
      if (parts[0] === 'site-settings') return { data: await db.getSiteSettings() };
      if (parts[0] === 'todays-offers') {
        // Handle both /todays-offers and /todays-offers/all
        return { data: { data: await db.getTodaysOffers() } };
      }
      if (parts[0] === 'seo') return { data: {} };
      
      return { data: { data: [] } };
    } catch (error) {
      console.error('API GET Error:', url, error);
      throw error;
    }
  },
  
  post: async (url, data) => {
    try {
      const parts = url.replace('/api/', '').split('/').filter(Boolean);
      
      if (parts[0] === 'menu') return { data: { data: await db.createMenuItem(data) } };
      if (parts[0] === 'orders') return { data: { data: await db.createOrder(data) } };
      if (parts[0] === 'reservations') return { data: { data: await db.createReservation(data) } };
      if (parts[0] === 'coupons') {
        if (parts[1] === 'validate') return { data: { data: await db.validateCoupon(data.code) } };
        return { data: { data: await db.createCoupon(data) } };
      }
      if (parts[0] === 'gallery') return { data: { data: await db.createGalleryImage(data) } };
      if (parts[0] === 'reviews') return { data: { data: await db.createReview(data) } };
      if (parts[0] === 'features') return { data: { data: await db.createFeature(data) } };
      if (parts[0] === 'team') return { data: { data: await db.createTeamMember(data) } };
      if (parts[0] === 'todays-offers') return { data: { data: await db.createTodaysOffer(data) } };
      if (parts[0] === 'admin' && parts[1] === 'users') return { data: { data: await db.createUser(data) } };
      if (parts[0] === 'contact-info' && parts[1] === 'send-message') {
        return { data: { success: true, data: await db.createContactMessage(data), message: 'Thank you for your message! We will get back to you soon.' } };
      }
      
      return { data: { data: {} } };
    } catch (error) {
      console.error('API POST Error:', url, error);
      throw error;
    }
  },
  
  put: async (url, data) => {
    try {
      const parts = url.replace('/api/', '').split('/').filter(Boolean);
      
      // Handle orders with status endpoint: /orders/:id/status
      if (parts[0] === 'orders' && parts[2] === 'status') {
        const id = parts[1];
        return { data: { data: await db.updateOrder(id, data) } };
      }
      
      const id = parts[parts.length - 1];
      
      if (parts[0] === 'menu') return { data: { data: await db.updateMenuItem(id, data) } };
      if (parts[0] === 'orders') return { data: { data: await db.updateOrder(id, data) } };
      if (parts[0] === 'reservations') return { data: { data: await db.updateReservation(id, data) } };
      if (parts[0] === 'admin' && parts[1] === 'reservations' && parts[3] === 'status') {
        return { data: { data: await db.updateReservation(parts[2], data) } };
      }
      if (parts[0] === 'coupons') return { data: { data: await db.updateCoupon(id, data) } };
      if (parts[0] === 'gallery') return { data: { data: await db.updateGalleryImage(id, data) } };
      if (parts[0] === 'reviews') return { data: { data: await db.updateReview(id, data) } };
      if (parts[0] === 'users') return { data: await db.updateUser(id, data) };
      if (parts[0] === 'features') return { data: { data: await db.updateFeature(id, data) } };
      if (parts[0] === 'team') return { data: { data: await db.updateTeamMember(id, data) } };
      if (parts[0] === 'hero') return { data: { data: await db.updateAboutContent(data) } };
      if (parts[0] === 'about') return { data: { data: await db.updateAboutContent(data) } };
      if (parts[0] === 'contact-info') return { data: { data: await db.updateContactInfo(data) } };
      if (parts[0] === 'site-settings') return { data: { data: await db.updateSiteSettings(data) } };
      if (parts[0] === 'todays-offers') return { data: { data: await db.updateTodaysOffer(id, data) } };
      if (parts[0] === 'seo') return { data: { data: {} } };
      
      // Toggle endpoints
      if (parts[0] === 'menu' && parts[2] === 'toggle-homepage') {
        return { data: { data: await db.toggleMenuItemHomepage(parts[1]) } };
      }
      if (parts[0] === 'reviews' && parts[2] === 'toggle-homepage') {
        return { data: { data: await db.toggleReviewHomepage(parts[1]) } };
      }
      if (parts[0] === 'reviews' && parts[2] === 'respond') {
        return { data: { data: await db.respondToReview(parts[1], data.response) } };
      }
      if (parts[0] === 'admin' && parts[1] === 'reviews' && parts[3] === 'toggle-publish') {
        return { data: { data: await db.toggleReviewPublish(parts[2]) } };
      }
      if (parts[0] === 'team' && parts[2] === 'toggle-about') {
        return { data: { data: await db.toggleTeamMemberAbout(parts[1]) } };
      }
      
      // Contact message updates
      if (parts[0] === 'contact-info' && parts[1] === 'messages') {
        return { data: { data: await db.updateContactMessage(parts[2], data) } };
      }
      
      return { data: { data: {} } };
    } catch (error) {
      console.error('API PUT Error:', url, error);
      throw error;
    }
  },
  
  patch: async (url, data) => {
    try {
      const parts = url.replace('/api/', '').split('/').filter(Boolean);
      const id = parts[parts.length - 2] || parts[parts.length - 1];
      
      if (parts[0] === 'coupons' && parts[2] === 'toggle') {
        const coupons = await db.getCoupons();
        const coupon = coupons.find(c => c._id === id);
        return { data: { data: await db.updateCoupon(id, { isActive: !coupon.isActive }) } };
      }
      if (parts[0] === 'menu' && parts[2] === 'toggle') {
        const items = await db.getMenuItems();
        const item = items.find(i => i._id === id);
        return { data: { data: await db.updateMenuItem(id, { isAvailable: !item.isAvailable }) } };
      }
      if (parts[0] === 'todays-offers' && parts[2] === 'toggle') {
        return { data: { data: await db.toggleTodaysOffer(parts[1]) } };
      }
      
      return api.put(url, data);
    } catch (error) {
      console.error('API PATCH Error:', url, error);
      throw error;
    }
  }
};

api.delete = async (url) => {
  try {
    const parts = url.replace('/api/', '').split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    
    if (parts[0] === 'menu') return { data: { data: await db.deleteMenuItem(id) } };
    if (parts[0] === 'coupons') return { data: { data: await db.deleteCoupon(id) } };
    if (parts[0] === 'gallery') return { data: { data: await db.deleteGalleryImage(id) } };
    if (parts[0] === 'reviews') return { data: { data: await db.deleteReview(id) } };
    if (parts[0] === 'users') return { data: await db.deleteUser(id) };
    if (parts[0] === 'features') return { data: { data: await db.deleteFeature(id) } };
    if (parts[0] === 'team') return { data: { data: await db.deleteTeamMember(id) } };
    if (parts[0] === 'todays-offers') return { data: { data: await db.deleteTodaysOffer(id) } };
    if (parts[0] === 'contact-info' && parts[1] === 'messages') {
      return { data: { data: await db.deleteContactMessage(parts[2]) } };
    }
    
    return { data: { data: {} } };
  } catch (error) {
    console.error('API DELETE Error:', url, error);
    throw error;
  }
};

export default api;
