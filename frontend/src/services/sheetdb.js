import axios from 'axios';

const SHEETDB_API = 'https://sheetdb.io/api/v1/qfa6hx74jtnim';

// Create axios instance for SheetDB
const sheetdb = axios.create({
  baseURL: SHEETDB_API,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper function to get current timestamp
const getTimestamp = () => new Date().toISOString();

// Normalize boolean-ish values coming back from SheetDB/Google Sheets
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  }
  return defaultValue;
};

// Safely derive a comparable timestamp from a record
const getRecordTimestamp = (record) => {
  if (!record) return 0;
  const source = record.updated_at || record.created_at || record.createdAt || record.updatedAt;
  const time = Date.parse(source || '');
  return Number.isNaN(time) ? 0 : time;
};

// When duplicates exist in SheetDB, prefer the newest record
const pickLatestRecord = (records) => {
  if (!Array.isArray(records) || records.length === 0) return null;
  if (records.length === 1) return records[0];
  return records.reduce((latest, current) => {
    const latestTime = getRecordTimestamp(latest);
    const currentTime = getRecordTimestamp(current);
    return currentTime >= latestTime ? current : latest;
  });
};

// ============ USERS ============
export const createUser = async (userData) => {
  try {
    const userId = generateId();
    const user = {
      id: userId,
      table_type: 'user',
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      role: userData.role || 'customer',
      avatar: userData.avatar || '',
      address_street: userData.address?.street || '',
      address_city: userData.address?.city || '',
      address_state: userData.address?.state || '',
      address_zipcode: userData.address?.zipCode || '',
      address_country: userData.address?.country || '',
      favorite_items: JSON.stringify(userData.favoriteItems || []),
      permissions: JSON.stringify(userData.permissions || []),
      refresh_token: '',
      is_active: true,
      email_verified: false,
      created_at: getTimestamp(),
      updated_at: getTimestamp()
    };
    console.log('Creating user in SheetDB:', { email: user.email, role: user.role });
    const response = await sheetdb.post('', user);
    console.log('SheetDB createUser response:', response.data);
    // Return the user object with ID
    return { ...user, id: userId };
  } catch (error) {
    console.error('SheetDB createUser error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUsers = async () => {
  const response = await sheetdb.get('/search?table_type=user');
  const users = Array.isArray(response.data) ? response.data : [];
  // Parse boolean fields from SheetDB strings
  return users.map(user => ({
    ...user,
    is_active: parseBoolean(user.is_active, true),
    email_verified: parseBoolean(user.email_verified),
    favorite_items: typeof user.favorite_items === 'string' ? JSON.parse(user.favorite_items || '[]') : (user.favorite_items || []),
    permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || [])
  }));
};

export const getUserByEmail = async (email) => {
  try {
    console.log('Searching for user by email:', email);
    const response = await sheetdb.get(`/search?table_type=user&email=${email}`);
    console.log('getUserByEmail response:', response.data);
    const user = pickLatestRecord(response.data);
    if (!user) return null;
    
    // Parse boolean fields from SheetDB strings
    return {
      ...user,
      is_active: parseBoolean(user.is_active, true),
      email_verified: parseBoolean(user.email_verified),
      favorite_items: typeof user.favorite_items === 'string' ? JSON.parse(user.favorite_items || '[]') : (user.favorite_items || []),
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || [])
    };
  } catch (error) {
    console.error('getUserByEmail error:', error.response?.data || error.message);
    // Return null if not found (404 is expected for new users)
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  userData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

// ============ MENU ITEMS ============
export const createMenuItem = async (itemData) => {
  const item = {
    id: generateId(),
    table_type: 'menu_item',
    name: itemData.name,
    description: itemData.description,
    price: itemData.price,
    category: itemData.category,
    sub_category: itemData.subCategory || '',
    image: itemData.image,
    ingredients: JSON.stringify(itemData.ingredients || []),
    allergens: JSON.stringify(itemData.allergens || []),
    dietary_info: JSON.stringify(itemData.dietaryInfo || []),
    is_available: itemData.isAvailable !== false,
    is_special: itemData.isSpecial || false,
    preparation_time: itemData.preparationTime || 0,
    calories: itemData.calories || 0,
    serving_size: itemData.servingSize || '',
    rating_average: 0,
    rating_count: 0,
    order_count: 0,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', item);
  return response.data;
};

export const getMenuItems = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=menu_item');
    console.log('getMenuItems response:', response.data);
    const items = Array.isArray(response.data) ? response.data : [];
    // Parse numeric fields from strings
    return items.map(item => ({
      ...item,
      _id: item.id,
      price: parseFloat(item.price) || 0,
      preparation_time: parseInt(item.preparation_time) || 0,
      calories: parseInt(item.calories) || 0,
      rating_average: parseFloat(item.rating_average) || 0,
      rating_count: parseInt(item.rating_count) || 0,
      order_count: parseInt(item.order_count) || 0,
      isAvailable: parseBoolean(item.is_available),
      is_available: parseBoolean(item.is_available),
      is_special: parseBoolean(item.is_special),
      ingredients: typeof item.ingredients === 'string' ? JSON.parse(item.ingredients || '[]') : (item.ingredients || []),
      allergens: typeof item.allergens === 'string' ? JSON.parse(item.allergens || '[]') : (item.allergens || []),
      dietaryInfo: typeof item.dietary_info === 'string' ? JSON.parse(item.dietary_info || '[]') : (item.dietary_info || [])
    }));
  } catch (error) {
    console.error('getMenuItems error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const getMenuItemById = async (id) => {
  const response = await sheetdb.get(`/search?table_type=menu_item&id=${id}`);
  const item = response.data[0] || null;
  if (!item) return null;
  // Parse numeric fields from strings
  return {
    ...item,
    price: parseFloat(item.price) || 0,
    preparation_time: parseInt(item.preparation_time) || 0,
    calories: parseInt(item.calories) || 0,
    rating_average: parseFloat(item.rating_average) || 0,
    rating_count: parseInt(item.rating_count) || 0,
    order_count: parseInt(item.order_count) || 0,
    is_available: parseBoolean(item.is_available),
    is_special: parseBoolean(item.is_special),
    ingredients: typeof item.ingredients === 'string' ? JSON.parse(item.ingredients || '[]') : (item.ingredients || []),
    allergens: typeof item.allergens === 'string' ? JSON.parse(item.allergens || '[]') : (item.allergens || []),
    dietaryInfo: typeof item.dietary_info === 'string' ? JSON.parse(item.dietary_info || '[]') : (item.dietary_info || [])
  };
};

export const updateMenuItem = async (id, itemData) => {
  const payload = { ...itemData };
  if ('isAvailable' in payload) {
    payload.is_available = payload.isAvailable;
    delete payload.isAvailable;
  }
  payload.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, payload);
  return response.data;
};

export const toggleMenuItemAvailability = async (id) => {
  // Get current menu item using search endpoint
  const response = await sheetdb.get(`/search?id=${id}`);
  const currentItem = response.data[0];
  if (!currentItem) throw new Error('Menu item not found');
  
  // Toggle is_available
  const newStatus = !parseBoolean(currentItem.is_available);
  const updateData = {
    is_available: newStatus,
    updated_at: getTimestamp()
  };
  
  const updateResponse = await sheetdb.patch(`/id/${id}`, updateData);
  return updateResponse.data;
};

export const deleteMenuItem = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

// ============ ORDERS ============
export const createOrder = async (orderData) => {
  const order = {
    id: generateId(),
    table_type: 'order',
    order_number: 'ORD-' + Date.now(),
    user_id: orderData.userId,
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    delivery_fee: orderData.deliveryFee || 0,
    discount: orderData.discount || 0,
    coupon_code: orderData.couponCode || '',
    total: orderData.total,
    status: orderData.status || 'pending',
    order_type: orderData.orderType,
    payment_method: orderData.paymentMethod || 'cash',
    payment_status: orderData.paymentStatus || 'pending',
    delivery_address_street: orderData.deliveryAddress?.street || '',
    delivery_address_city: orderData.deliveryAddress?.city || '',
    delivery_address_state: orderData.deliveryAddress?.state || '',
    delivery_address_zipcode: orderData.deliveryAddress?.zipCode || '',
    customer_name: orderData.customerName,
    customer_email: orderData.customerEmail,
    customer_phone: orderData.customerPhone,
    special_instructions: orderData.specialInstructions || '',
    estimated_time: orderData.estimatedTime || '',
    completed_at: '',
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', order);
  return response.data;
};

export const getOrders = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=order');
    const orders = Array.isArray(response.data) ? response.data : [];
    // Parse numeric fields from strings
    return orders.map(order => ({
      ...order,
      _id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      subtotal: parseFloat(order.subtotal) || 0,
      tax: parseFloat(order.tax) || 0,
      delivery_fee: parseFloat(order.delivery_fee) || 0,
      deliveryFee: parseFloat(order.delivery_fee) || 0,
      discount: parseFloat(order.discount) || 0,
      total: parseFloat(order.total) || 0,
      couponCode: order.coupon_code,
      orderType: order.order_type,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      specialInstructions: order.special_instructions,
      estimatedTime: order.estimated_time,
      completedAt: order.completed_at
    }));
  } catch (error) {
    console.error('getOrders error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const getOrdersByUserId = async (userId) => {
  const response = await sheetdb.get(`/search?table_type=order&user_id=${userId}`);
  const orders = Array.isArray(response.data) ? response.data : [];
  // Parse numeric fields from strings
  return orders.map(order => ({
    ...order,
    _id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    subtotal: parseFloat(order.subtotal) || 0,
    tax: parseFloat(order.tax) || 0,
    delivery_fee: parseFloat(order.delivery_fee) || 0,
    deliveryFee: parseFloat(order.delivery_fee) || 0,
    discount: parseFloat(order.discount) || 0,
    total: parseFloat(order.total) || 0,
    couponCode: order.coupon_code,
    orderType: order.order_type,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    specialInstructions: order.special_instructions,
    estimatedTime: order.estimated_time,
    completedAt: order.completed_at
  }));
};

export const updateOrder = async (id, orderData) => {
  orderData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, orderData);
  return response.data;
};

// ============ ORDER ITEMS ============
export const createOrderItem = async (itemData) => {
  const orderItem = {
    id: generateId(),
    table_type: 'order_item',
    order_id: itemData.orderId,
    menu_item_id: itemData.menuItemId,
    menu_item_name: itemData.menuItemName,
    quantity: itemData.quantity,
    price: itemData.price,
    special_instructions: itemData.specialInstructions || '',
    created_at: getTimestamp()
  };
  const response = await sheetdb.post('', orderItem);
  return response.data;
};

export const getOrderItems = async (orderId) => {
  const response = await sheetdb.get(`/search?table_type=order_item&order_id=${orderId}`);
  const items = Array.isArray(response.data) ? response.data : [];
  // Parse numeric fields from strings
  return items.map(item => ({
    ...item,
    quantity: parseInt(item.quantity) || 0,
    price: parseFloat(item.price) || 0
  }));
};

// ============ RESERVATIONS ============
export const createReservation = async (reservationData) => {
  const reservation = {
    id: generateId(),
    table_type: 'reservation',
    reservation_number: 'RES-' + Date.now(),
    user_id: reservationData.userId,
    guest_name: reservationData.guestName,
    guest_email: reservationData.guestEmail,
    guest_phone: reservationData.guestPhone,
    number_of_guests: reservationData.numberOfGuests,
    date: reservationData.date,
    time_slot: reservationData.timeSlot,
    table_number: reservationData.tableNumber || '',
    status: reservationData.status || 'pending',
    special_requests: reservationData.specialRequests || '',
    occasion: reservationData.occasion || '',
    confirmed_at: '',
    cancelled_at: '',
    cancellation_reason: '',
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', reservation);
  return response.data;
};

export const getReservations = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=reservation');
    const reservations = Array.isArray(response.data) ? response.data : [];
    // Map fields to match UI expectations
    return reservations.map(res => ({
      ...res,
      _id: res.id,
      reservationNumber: res.reservation_number,
      userId: res.user_id,
      guestName: res.guest_name,
      guestEmail: res.guest_email,
      guestPhone: res.guest_phone,
      numberOfGuests: parseInt(res.number_of_guests) || 1,
      number_of_guests: parseInt(res.number_of_guests) || 1,
      timeSlot: res.time_slot,
      tableNumber: res.table_number,
      specialRequests: res.special_requests,
      confirmedAt: res.confirmed_at,
      cancelledAt: res.cancelled_at,
      cancellationReason: res.cancellation_reason
    }));
  } catch (error) {
    console.error('getReservations error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const updateReservation = async (id, reservationData) => {
  reservationData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, reservationData);
  return response.data;
};

// ============ COUPONS ============
export const createCoupon = async (couponData) => {
  const coupon = {
    id: generateId(),
    table_type: 'coupon',
    code: couponData.code.toUpperCase(),
    description: couponData.description,
    discount_type: couponData.discountType,
    discount_value: couponData.discountValue,
    min_order_amount: couponData.minOrderAmount || 0,
    max_discount_amount: couponData.maxDiscountAmount || '',
    valid_from: couponData.validFrom,
    valid_until: couponData.validUntil,
    usage_limit: couponData.usageLimit || '',
    used_count: 0,
    is_active: couponData.isActive !== false,
    applicable_categories: JSON.stringify(couponData.applicableCategories || []),
    created_by: couponData.createdBy,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', coupon);
  return response.data;
};

export const getCoupons = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=coupon');
    const coupons = Array.isArray(response.data) ? response.data : [];
    // Parse numeric fields from strings and add _id field, map to camelCase
    return coupons.map(coupon => ({
      ...coupon,
      _id: coupon.id, // Add _id for frontend compatibility
      discountType: coupon.discount_type,
      discountValue: parseFloat(coupon.discount_value) || 0,
      minOrderAmount: parseFloat(coupon.min_order_amount) || 0,
      maxDiscountAmount: parseFloat(coupon.max_discount_amount) || null,
      validFrom: coupon.valid_from,
      validUntil: coupon.valid_until,
      usageLimit: parseInt(coupon.usage_limit) || null,
      usedCount: parseInt(coupon.used_count) || 0,
      isActive: parseBoolean(coupon.is_active),
      applicableCategories: coupon.applicable_categories ? JSON.parse(coupon.applicable_categories) : []
    }));
  } catch (error) {
    console.error('getCoupons error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const validateCoupon = async (code) => {
  const response = await sheetdb.get(`/search?table_type=coupon&code=${code.toUpperCase()}`);
  const couponData = response.data[0];
  
  if (!couponData) return { valid: false, message: 'Invalid coupon code' };
  
  // Parse numeric fields
  const coupon = {
    ...couponData,
    discount_value: parseFloat(couponData.discount_value) || 0,
    min_order_amount: parseFloat(couponData.min_order_amount) || 0,
    max_discount_amount: parseFloat(couponData.max_discount_amount) || 0,
    usage_limit: parseInt(couponData.usage_limit) || 0,
    used_count: parseInt(couponData.used_count) || 0,
    is_active: parseBoolean(couponData.is_active)
  };
  
  if (!coupon.is_active) return { valid: false, message: 'Coupon is inactive' };
  
  const now = new Date();
  if (new Date(coupon.valid_from) > now) return { valid: false, message: 'Coupon not yet valid' };
  if (new Date(coupon.valid_until) < now) return { valid: false, message: 'Coupon has expired' };
  
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  return { valid: true, coupon };
};

export const updateCoupon = async (id, couponData) => {
  couponData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, couponData);
  return response.data;
};

export const toggleCouponStatus = async (id) => {
  // Get current coupon using search endpoint
  const response = await sheetdb.get(`/search?id=${id}`);
  const currentCoupon = response.data[0];
  if (!currentCoupon) throw new Error('Coupon not found');
  
  // Toggle is_active
  const newStatus = !parseBoolean(currentCoupon.is_active);
  const updateData = {
    is_active: newStatus,
    updated_at: getTimestamp()
  };
  
  const updateResponse = await sheetdb.patch(`/id/${id}`, updateData);
  return updateResponse.data;
};

export const deleteCoupon = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

// ============ GALLERY ============
export const createGalleryItem = async (galleryData) => {
  const gallery = {
    id: generateId(),
    table_type: 'gallery',
    title: galleryData.title,
    description: galleryData.description || '',
    image: galleryData.image,
    category: galleryData.category,
    tags: JSON.stringify(galleryData.tags || []),
    is_published: galleryData.isPublished !== false,
    order: galleryData.order || 0,
    uploaded_by: galleryData.uploadedBy || '',
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', gallery);
  return response.data;
};

export const getGalleryItems = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=gallery');
    const items = Array.isArray(response.data) ? response.data : [];
    // Parse numeric and boolean fields
    return items.map(item => ({
      ...item,
      _id: item.id,
      order: parseInt(item.order) || 0,
      is_published: parseBoolean(item.is_published),
      isPublished: parseBoolean(item.is_published),
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || [])
    }));
  } catch (error) {
    console.error('getGalleryItems error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const updateGalleryItem = async (id, galleryData) => {
  galleryData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, galleryData);
  return response.data;
};

export const deleteGalleryItem = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

// ============ CMS CONTENT ============
export const getHeroSection = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=hero_section');
    return response.data[0] || null;
  } catch (error) {
    console.error('getHeroSection error:', error.response?.data || error.message);
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const updateHeroSection = async (id, heroData) => {
  heroData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, heroData);
  return response.data;
};

export const getAboutSection = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=about_section');
    const data = response.data[0] || null;
    if (!data) return null;
    // Parse numeric fields from stats
    return {
      ...data,
      stat1_value: parseInt(data.stat1_value) || 0,
      stat2_value: parseInt(data.stat2_value) || 0,
      stat3_value: parseInt(data.stat3_value) || 0,
      stat4_value: parseInt(data.stat4_value) || 0
    };
  } catch (error) {
    console.error('getAboutSection error:', error.response?.data || error.message);
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const updateAboutSection = async (id, aboutData) => {
  aboutData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, aboutData);
  return response.data;
};

export const getFeatures = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=feature');
    const features = Array.isArray(response.data) ? response.data : [];
    // Parse numeric and boolean fields
    return features.map(feat => ({
      ...feat,
      _id: feat.id,
      order: parseInt(feat.order) || 0,
      is_active: parseBoolean(feat.is_active),
      isActive: parseBoolean(feat.is_active)
    }));
  } catch (error) {
    console.error('getFeatures error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const createFeature = async (featureData) => {
  const feature = {
    id: generateId(),
    table_type: 'feature',
    icon: featureData.icon,
    title: featureData.title,
    description: featureData.description,
    order: featureData.order || 0,
    is_active: featureData.isActive !== false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', feature);
  return response.data;
};

export const updateFeature = async (id, featureData) => {
  featureData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, featureData);
  return response.data;
};

export const deleteFeature = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

export const getTeamMembers = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=team_member');
    const members = Array.isArray(response.data) ? response.data : [];
    // Parse numeric and boolean fields
    return members.map(member => ({
      ...member,
      _id: member.id,
      order: parseInt(member.order) || 0,
      is_active: parseBoolean(member.is_active),
      isActive: parseBoolean(member.is_active),
      social_links: typeof member.social_links === 'string' ? JSON.parse(member.social_links || '{}') : (member.social_links || {}),
      socialLinks: typeof member.social_links === 'string' ? JSON.parse(member.social_links || '{}') : (member.social_links || {})
    }));
  } catch (error) {
    console.error('getTeamMembers error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const createTeamMember = async (teamData) => {
  const team = {
    id: generateId(),
    table_type: 'team_member',
    name: teamData.name,
    position: teamData.position,
    bio: teamData.bio,
    image: teamData.image,
    email: teamData.email || '',
    phone: teamData.phone || '',
    social_links: JSON.stringify(teamData.socialLinks || {}),
    order: teamData.order || 0,
    is_active: teamData.isActive !== false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', team);
  return response.data;
};

export const updateTeamMember = async (id, teamData) => {
  teamData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, teamData);
  return response.data;
};

export const deleteTeamMember = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

export const getContactInfo = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=contact_info');
    return response.data[0] || null;
  } catch (error) {
    console.error('getContactInfo error:', error.response?.data || error.message);
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const updateContactInfo = async (id, contactData) => {
  contactData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, contactData);
  return response.data;
};

export const getSiteSettings = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=site_settings');
    return response.data[0] || null;
  } catch (error) {
    console.error('getSiteSettings error:', error.response?.data || error.message);
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const updateSiteSettings = async (id, settingsData) => {
  settingsData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, settingsData);
  return response.data;
};

export const getSEO = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=seo');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getSEO error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const getSEOByPage = async (page) => {
  const response = await sheetdb.get(`/search?table_type=seo&page=${page}`);
  return response.data[0] || null;
};

export const updateSEO = async (id, seoData) => {
  seoData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, seoData);
  return response.data;
};

// ============ REVIEWS ============
export const createReview = async (reviewData) => {
  const review = {
    id: generateId(),
    table_type: 'review',
    user_id: reviewData.userId,
    order_id: reviewData.orderId || '',
    menu_item_id: reviewData.menuItemId || '',
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    images: JSON.stringify(reviewData.images || []),
    response_text: '',
    response_by_user_id: '',
    responded_at: '',
    is_published: reviewData.isPublished !== false,
    is_verified_purchase: reviewData.isVerifiedPurchase || false,
    helpful_count: 0,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  const response = await sheetdb.post('', review);
  return response.data;
};

export const getReviews = async () => {
  try {
    const response = await sheetdb.get('/search?table_type=review');
    const reviews = Array.isArray(response.data) ? response.data : [];
    // Parse numeric and boolean fields
    return reviews.map(review => ({
      ...review,
      _id: review.id,
      rating: parseInt(review.rating) || 0,
      helpful_count: parseInt(review.helpful_count) || 0,
      helpfulCount: parseInt(review.helpful_count) || 0,
      is_published: parseBoolean(review.is_published),
      isPublished: parseBoolean(review.is_published),
      is_verified_purchase: parseBoolean(review.is_verified_purchase),
      isVerifiedPurchase: parseBoolean(review.is_verified_purchase),
      images: typeof review.images === 'string' ? JSON.parse(review.images || '[]') : (review.images || [])
    }));
  } catch (error) {
    console.error('getReviews error:', error.response?.data || error.message);
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  reviewData.updated_at = getTimestamp();
  const response = await sheetdb.patch(`/id/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await sheetdb.delete(`/id/${id}`);
  return response.data;
};

export default sheetdb;
