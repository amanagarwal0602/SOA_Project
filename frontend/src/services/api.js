import axios from 'axios';
import * as db from './localStorage';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    if (port === '3000') {
      return `${protocol}//${hostname}:5000/api`;
    }
    return `${origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach JWT Bearer Token to outgoing requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

const normalizeUrl = (url) => {
  if (url.startsWith('/api/')) return url.replace('/api', '');
  if (url.startsWith('api/')) return url.replace('api', '');
  return url.startsWith('/') ? url : `/${url}`;
};

// Fallback executor using localStorage for resilience
const fallbackGet = async (url, config = {}) => {
  const parts = url.replace(/^\//, '').split('/').filter(Boolean);
  if (parts[0] === 'menu') {
    if (parts[1] === 'categories' && parts[2] === 'list') {
      const items = await db.getMenuItems();
      const unique = [...new Set(items.map(i => i.category))].filter(Boolean);
      return { data: { data: unique.map(c => ({ category: c })) } };
    }
    const items = await db.getMenuItems();
    const cat = config.params?.category;
    const filtered = (cat && cat !== 'all') ? items.filter(i => i.category === cat) : items;
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
  if (parts[0] === 'team') return { data: await db.getTeamMembers() };
  if (parts[0] === 'hero') return { data: await db.getAboutContent() };
  if (parts[0] === 'about') return { data: await db.getAboutContent() };
  if (parts[0] === 'contact-info') {
    if (parts[1] === 'messages') return { data: { data: { messages: await db.getContactMessages() } } };
    return { data: await db.getContactInfo() };
  }
  if (parts[0] === 'site-settings') return { data: await db.getSiteSettings() };
  if (parts[0] === 'todays-offers') return { data: { data: await db.getTodaysOffers() } };
  if (parts[0] === 'seo') return { data: {} };
  return { data: { data: [] } };
};

const api = {
  get: async (url, config = {}) => {
    try {
      const endpoint = normalizeUrl(url);
      const res = await client.get(endpoint, config);
      return res;
    } catch (error) {
      if (!error.response) {
        console.warn(`Spring Boot Backend unreachable at ${API_BASE_URL}. Using fallback storage for GET ${url}`);
        return fallbackGet(normalizeUrl(url), config);
      }
      throw error;
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const endpoint = normalizeUrl(url);
      const res = await client.post(endpoint, data, config);
      return res;
    } catch (error) {
      if (!error.response) {
        console.warn(`Spring Boot Backend unreachable at ${API_BASE_URL}. Using fallback storage for POST ${url}`);
        const parts = normalizeUrl(url).replace(/^\//, '').split('/').filter(Boolean);
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
        if (parts[0] === 'contact-info' && parts[1] === 'send-message') {
          return { data: { success: true, data: await db.createContactMessage(data), message: 'Thank you for your message!' } };
        }
        return { data: { data: {} } };
      }
      throw error;
    }
  },

  put: async (url, data, config = {}) => {
    try {
      const endpoint = normalizeUrl(url);
      const res = await client.put(endpoint, data, config);
      return res;
    } catch (error) {
      if (!error.response) {
        console.warn(`Spring Boot Backend unreachable at ${API_BASE_URL}. Using fallback storage for PUT ${url}`);
        const parts = normalizeUrl(url).replace(/^\//, '').split('/').filter(Boolean);
        const id = parts[parts.length - 1];
        if (parts[0] === 'menu') return { data: { data: await db.updateMenuItem(id, data) } };
        if (parts[0] === 'orders') return { data: { data: await db.updateOrder(id, data) } };
        if (parts[0] === 'reservations') return { data: { data: await db.updateReservation(id, data) } };
        if (parts[0] === 'coupons') return { data: { data: await db.updateCoupon(id, data) } };
        if (parts[0] === 'gallery') return { data: { data: await db.updateGalleryImage(id, data) } };
        if (parts[0] === 'reviews') return { data: { data: await db.updateReview(id, data) } };
        if (parts[0] === 'features') return { data: { data: await db.updateFeature(id, data) } };
        if (parts[0] === 'team') return { data: { data: await db.updateTeamMember(id, data) } };
        if (parts[0] === 'hero' || parts[0] === 'about') return { data: { data: await db.updateAboutContent(data) } };
        if (parts[0] === 'contact-info') return { data: { data: await db.updateContactInfo(data) } };
        if (parts[0] === 'site-settings') return { data: { data: await db.updateSiteSettings(data) } };
        if (parts[0] === 'todays-offers') return { data: { data: await db.updateTodaysOffer(id, data) } };
        return { data: { data: {} } };
      }
      throw error;
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      const endpoint = normalizeUrl(url);
      const res = await client.patch(endpoint, data, config);
      return res;
    } catch (error) {
      if (!error.response) {
        return api.put(url, data, config);
      }
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      const endpoint = normalizeUrl(url);
      const res = await client.delete(endpoint, config);
      return res;
    } catch (error) {
      if (!error.response) {
        console.warn(`Spring Boot Backend unreachable. Using fallback storage for DELETE ${url}`);
        const parts = normalizeUrl(url).replace(/^\//, '').split('/').filter(Boolean);
        const id = parts[parts.length - 1];
        if (parts[0] === 'menu') return { data: { data: await db.deleteMenuItem(id) } };
        if (parts[0] === 'coupons') return { data: { data: await db.deleteCoupon(id) } };
        if (parts[0] === 'gallery') return { data: { data: await db.deleteGalleryImage(id) } };
        if (parts[0] === 'reviews') return { data: { data: await db.deleteReview(id) } };
        if (parts[0] === 'features') return { data: { data: await db.deleteFeature(id) } };
        if (parts[0] === 'team') return { data: { data: await db.deleteTeamMember(id) } };
        if (parts[0] === 'todays-offers') return { data: { data: await db.deleteTodaysOffer(id) } };
        return { data: { data: {} } };
      }
      throw error;
    }
  }
};

export default api;
