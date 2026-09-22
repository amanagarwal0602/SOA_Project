// LocalStorage Database - Temporary replacement for SheetDB
// Same column names as SheetDB for easy migration

// Helper function to generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper function to get current timestamp
const getTimestamp = () => new Date().toISOString();

// Initialize localStorage with default data
const initializeData = () => {
  const existingData = localStorage.getItem('cafe_data');
  const DATA_VERSION = '2.2'; // Dynamic data: reviews, gallery, team, features only in sample data
  
  // DON'T reinitialize if data exists - let App.js handle sample data loading
  if (existingData) {
    try {
      const parsed = JSON.parse(existingData);
      // Only check if data is valid JSON
      if (parsed && typeof parsed === 'object') {
        return; // Data exists and is valid, don't reinitialize
      }
    } catch (e) {
      console.log('Invalid data format, reinitializing...');
    }
  }
  
  // Only initialize with minimal default structure if no data exists at all
  if (!existingData) {
    const now = getTimestamp();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Minimal default data - only essential demo/admin users
    // All other data (menu, gallery, reviews, etc.) comes from sampleDataFull.json
    const defaultData = {
      users: [
        {
          id: 'demo001',
          table_type: 'user',
          name: 'Demo User',
          email: 'demo@demo.com',
          username: 'demo',
          password: 'demo',
          phone: '+91-98765-43210',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          address_street: '456 Demo Street',
          address_city: 'Mumbai',
          address_state: 'Maharashtra',
          address_zipcode: '400001',
          address_country: 'India',
          favorite_items: [],
          permissions: ['view_dashboard', 'view_orders', 'view_menu', 'view_reservations'],
          refresh_token: '',
          is_active: true,
          email_verified: true,
          created_at: now,
          updated_at: now
        },
        {
          id: 'admin000',
          table_type: 'user',
          name: 'Admin',
          email: 'admin@admin.com',
          username: 'admin',
          password: 'admin',
          phone: '+91-98765-43211',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          address_street: '123 Admin Avenue',
          address_city: 'Mumbai',
          address_state: 'Maharashtra',
          address_zipcode: '400001',
          address_country: 'India',
          favorite_items: [],
          permissions: ['all'],
          refresh_token: '',
          is_active: true,
          email_verified: true,
          created_at: now,
          updated_at: now
        }
      ],
      menu: [],
      orders: [],
      reservations: [],
      coupons: [],
      gallery: [],
      reviews: [],
      features: [],
      team: [],
      about: [],
      contact: [],
      version: '2.2' // Data version for tracking updates
    };
    localStorage.setItem('cafe_data', JSON.stringify(defaultData));
    console.log('✅ Default empty structure initialized');
  }
};

// Get all data
const getData = () => {
  initializeData();
  return JSON.parse(localStorage.getItem('cafe_data'));
};

// Save all data
const saveData = (data) => {
  localStorage.setItem('cafe_data', JSON.stringify(data));
};

// ============ USERS ============
export const createUser = async (userData) => {
  const data = getData();
  const userId = generateId();
  const user = {
    id: userId,
    table_type: 'user',
    name: userData.name,
    username: userData.username || '',
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
    favorite_items: userData.favoriteItems || [],
    permissions: userData.permissions || [],
    refresh_token: '',
    is_active: true,
    email_verified: false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.users.unshift(user); // Add to beginning
  saveData(data);
  return user;
};

export const getUsers = async () => {
  const data = getData();
  return data.users || [];
};

export const getUserByEmail = async (email) => {
  const data = getData();
  return data.users.find(u => u.email === email) || null;
};

export const getUserByUsername = async (username) => {
  const data = getData();
  return data.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
};

export const getUserById = async (id) => {
  const data = getData();
  return data.users.find(u => u.id === id) || null;
};

export const updateUser = async (id, updates) => {
  const data = getData();
  const index = data.users.findIndex(u => u.id === id);
  if (index !== -1) {
    data.users[index] = {
      ...data.users[index],
      ...updates,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.users[index];
  }
  throw new Error('User not found');
};

export const deleteUser = async (id) => {
  const data = getData();
  data.users = data.users.filter(u => u.id !== id);
  saveData(data);
  return true;
};

// ============ MENU ============
export const createMenuItem = async (itemData) => {
  const data = getData();
  if (!data.menuItems) data.menuItems = [];
  if (!data.menu) data.menu = [];
  
  const menuArray = data.menuItems.length > 0 ? data.menuItems : data.menu;
  const itemId = generateId();
  const item = {
    id: itemId,
    table_type: 'menu',
    name: itemData.name,
    description: itemData.description || '',
    price: parseFloat(itemData.price) || 0,
    category: itemData.category,
    image: itemData.image || '',
    is_available: itemData.isAvailable !== false,
    is_veg: itemData.isVeg || false,
    spicy_level: itemData.spicyLevel || 0,
    ingredients: itemData.ingredients || [],
    allergens: itemData.allergens || [],
    nutrition_calories: itemData.nutrition?.calories || 0,
    nutrition_protein: itemData.nutrition?.protein || 0,
    nutrition_carbs: itemData.nutrition?.carbs || 0,
    nutrition_fat: itemData.nutrition?.fat || 0,
    prep_time: itemData.prepTime || 0,
    rating: 0,
    rating_count: 0,
    order_count: 0,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  menuArray.unshift(item); // Add to beginning
  saveData(data);
  return item;
};

export const getMenuItems = async () => {
  const data = getData();
  const menuData = data.menuItems || data.menu || [];
  return menuData.map(item => ({
    ...item,
    _id: item.id,
    image: item.image || item.imageUrl || item.image_url,
    price: parseFloat(item.price) || 0,
    isAvailable: item.is_available,
    isVeg: item.is_veg,
    spicyLevel: item.spicy_level,
    prepTime: item.prep_time,
    ratingCount: item.rating_count,
    nutrition: {
      calories: item.nutrition_calories,
      protein: item.nutrition_protein,
      carbs: item.nutrition_carbs,
      fat: item.nutrition_fat
    }
  }));
};

export const updateMenuItem = async (id, updates) => {
  const data = getData();
  const menuArray = data.menuItems || data.menu || [];
  const index = menuArray.findIndex(m => m.id === id);
  if (index !== -1) {
    menuArray[index] = {
      ...menuArray[index],
      name: updates.name || menuArray[index].name,
      description: updates.description !== undefined ? updates.description : menuArray[index].description,
      price: updates.price !== undefined ? parseFloat(updates.price) || 0 : menuArray[index].price,
      category: updates.category || menuArray[index].category,
      image: updates.image !== undefined ? updates.image : menuArray[index].image,
      is_available: updates.isAvailable !== undefined ? updates.isAvailable : menuArray[index].is_available,
      updated_at: getTimestamp()
    };
    saveData(data);
    return menuArray[index];
  }
  throw new Error('Menu item not found');
};

export const deleteMenuItem = async (id) => {
  const data = getData();
  if (data.menuItems) {
    data.menuItems = data.menuItems.filter(m => m.id !== id);
  }
  if (data.menu) {
    data.menu = data.menu.filter(m => m.id !== id);
  }
  saveData(data);
  return true;
};

// ============ ORDERS ============
export const createOrder = async (orderData) => {
  const data = getData();
  const orderId = generateId();
  
  // Calculate daily order number (day-wise reset)
  const today = new Date().toDateString();
  const todaysOrders = (data.orders || []).filter(order => {
    const orderDate = new Date(order.created_at).toDateString();
    return orderDate === today;
  });
  const dailyOrderNumber = todaysOrders.length + 1;
  
  const order = {
    id: orderId,
    table_type: 'order',
    daily_order_number: dailyOrderNumber, // Day-wise order number
    user_id: orderData.userId,
    user_name: orderData.userName || '',
    user_email: orderData.userEmail || '',
    user_phone: orderData.userPhone || '',
    items: orderData.items || [],
    subtotal: orderData.subtotal,
    tax: orderData.tax || 0,
    delivery_fee: orderData.deliveryFee || 0,
    discount: orderData.discount || 0,
    coupon_code: orderData.couponCode || '',
    total: orderData.total,
    status: orderData.status || 'pending',
    payment_method: orderData.paymentMethod || 'cash',
    payment_status: orderData.paymentStatus || 'pending',
    delivery_type: orderData.deliveryType || 'delivery',
    delivery_address_street: orderData.deliveryAddress?.street || '',
    delivery_address_city: orderData.deliveryAddress?.city || '',
    delivery_address_state: orderData.deliveryAddress?.state || '',
    delivery_address_zipcode: orderData.deliveryAddress?.zipCode || '',
    delivery_address_country: orderData.deliveryAddress?.country || '',
    special_instructions: orderData.specialInstructions || '',
    estimated_delivery: orderData.estimatedDelivery || '',
    has_reservation: orderData.hasReservation || false,
    reservation_date: orderData.reservationDate || null,
    reservation_time: orderData.reservationTime || null,
    number_of_guests: orderData.numberOfGuests || null,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.orders.unshift(order); // Add to beginning
  
  // If order includes a reservation, create a separate reservation entry
  if (orderData.hasReservation && orderData.reservationDate && orderData.reservationTime) {
    const resId = generateId();
    const reservation = {
      id: resId,
      table_type: 'reservation',
      user_id: orderData.userId,
      guest_name: orderData.userName || '',
      guest_email: orderData.userEmail || '',
      guest_phone: orderData.userPhone || orderData.contactPhone || '',
      date: orderData.reservationDate,
      time: orderData.reservationTime,
      time_slot: orderData.reservationTime,
      guests: parseInt(orderData.numberOfGuests) || 2,
      numberOfGuests: parseInt(orderData.numberOfGuests) || 2,
      number_of_guests: parseInt(orderData.numberOfGuests) || 2,
      table_number: '',
      status: 'pending',
      special_requests: orderData.specialInstructions ? `Order: ${orderData.specialInstructions}` : `Reservation from order #${orderId}`,
      order_id: orderId,
      created_at: getTimestamp(),
      updated_at: getTimestamp()
    };
    data.reservations.unshift(reservation); // Add to beginning
  }
  
  saveData(data);
  return order;
};

export const getOrders = async () => {
  const data = getData();
  return (data.orders || []).map(order => {
    // Parse items if stored as JSON string
    let items = order.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    
    // Map items to consistent format
    const mappedItems = (items || []).map(item => ({
      ...item,
      name: item.name || item.itemName || item.item_name,
      itemName: item.name || item.itemName || item.item_name,
      price: item.price || item.itemPrice || item.item_price || 0,
      itemPrice: item.price || item.itemPrice || item.item_price || 0,
      quantity: item.quantity || 1
    }));
    
    // Handle delivery address - can be string or object
    let deliveryAddress = order.delivery_address;
    if (typeof deliveryAddress === 'string') {
      // Keep as string for display
    } else if (deliveryAddress) {
      // If it's an object, format it
      deliveryAddress = `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} ${deliveryAddress.zipCode || ''}`.trim();
    } else {
      // Build from individual fields if available
      deliveryAddress = [
        order.delivery_address_street,
        order.delivery_address_city,
        order.delivery_address_state,
        order.delivery_address_zipcode
      ].filter(Boolean).join(', ');
    }
    
    return {
      ...order,
      _id: order.id,
      dailyOrderNumber: order.daily_order_number,
      orderNumber: order.order_number || order.orderNumber || order.id,
      total: order.total_price || order.total || 0,
      totalPrice: order.total_price || order.total || 0,
      userId: order.user_id,
      userName: order.user_name,
      userEmail: order.user_email,
      userPhone: order.user_phone,
      customerName: order.user_name,
      customerEmail: order.user_email,
      deliveryAddress: deliveryAddress,
      deliveryFee: order.delivery_fee,
      couponCode: order.coupon_code,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      deliveryType: order.delivery_type,
      specialInstructions: order.special_instructions,
      estimatedDelivery: order.estimated_delivery,
      hasReservation: order.has_reservation || false,
      reservationDate: order.reservation_date,
      reservationTime: order.reservation_time,
      numberOfGuests: order.number_of_guests,
      items: mappedItems,
      createdAt: order.created_at || order.createdAt,
      updatedAt: order.updated_at || order.updatedAt,
      status: order.status || 'pending'
    };
  });
};

export const updateOrder = async (id, updates) => {
  const data = getData();
  const index = data.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    data.orders[index] = {
      ...data.orders[index],
      ...updates,
      status: updates.status || data.orders[index].status,
      payment_status: updates.paymentStatus || data.orders[index].payment_status,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.orders[index];
  }
  throw new Error('Order not found');
};

export const deleteOrder = async (id) => {
  const data = getData();
  data.orders = data.orders.filter(o => o.id !== id);
  saveData(data);
  return true;
};

// ============ RESERVATIONS ============
export const createReservation = async (resData) => {
  const data = getData();
  const resId = generateId();
  const reservation = {
    id: resId,
    table_type: 'reservation',
    user_id: resData.userId || '',
    guest_name: resData.guestName,
    guest_email: resData.guestEmail,
    guest_phone: resData.guestPhone,
    date: resData.date,
    time: resData.timeSlot || resData.time,
    guests: parseInt(resData.numberOfGuests || resData.guests) || 2,
    numberOfGuests: parseInt(resData.numberOfGuests || resData.guests) || 2,
    table_number: resData.tableNumber || '',
    status: resData.status || 'pending',
    special_requests: resData.specialRequests || '',
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.reservations.unshift(reservation); // Add to beginning
  saveData(data);
  return reservation;
};

export const getReservations = async () => {
  const data = getData();
  return (data.reservations || []).map(res => ({
    ...res,
    _id: res.id,
    userId: res.user_id,
    guestName: res.guest_name,
    guestEmail: res.guest_email,
    guestPhone: res.guest_phone,
    guests: parseInt(res.guests || res.numberOfGuests || res.number_of_guests) || 0,
    numberOfGuests: parseInt(res.guests || res.numberOfGuests || res.number_of_guests) || 0,
    tableNumber: res.table_number,
    specialRequests: res.special_requests,
    order_id: res.order_id
  }));
};

export const updateReservation = async (id, updates) => {
  const data = getData();
  const index = data.reservations.findIndex(r => r.id === id);
  if (index !== -1) {
    data.reservations[index] = {
      ...data.reservations[index],
      status: updates.status || data.reservations[index].status,
      table_number: updates.tableNumber !== undefined ? updates.tableNumber : data.reservations[index].table_number,
      cancellation_reason: updates.cancellationReason || data.reservations[index].cancellation_reason,
      cancelled_at: updates.cancelledAt || data.reservations[index].cancelled_at,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.reservations[index];
  }
  throw new Error('Reservation not found');
};

export const deleteReservation = async (id) => {
  const data = getData();
  data.reservations = data.reservations.filter(r => r.id !== id);
  saveData(data);
  return true;
};

// ============ COUPONS ============
export const createCoupon = async (couponData) => {
  const data = getData();
  const couponId = generateId();
  const coupon = {
    id: couponId,
    table_type: 'coupon',
    code: couponData.code,
    description: couponData.description || '',
    discount_type: couponData.discountType,
    discount_value: couponData.discountValue,
    min_order_value: couponData.minOrderValue || 0,
    max_discount: couponData.maxDiscount || 0,
    valid_from: couponData.validFrom,
    valid_until: couponData.validUntil,
    usage_limit: couponData.usageLimit || 0,
    used_count: 0,
    is_active: couponData.isActive !== false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.coupons.push(coupon);
  saveData(data);
  return coupon;
};

export const getCoupons = async () => {
  const data = getData();
  return (data.coupons || []).map(coupon => ({
    ...coupon,
    _id: coupon.id,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    minOrderValue: coupon.min_order_value,
    maxDiscount: coupon.max_discount,
    validFrom: coupon.valid_from,
    validUntil: coupon.valid_until,
    usageLimit: coupon.usage_limit,
    usedCount: coupon.used_count,
    isActive: coupon.is_active
  }));
};

export const updateCoupon = async (id, updates) => {
  const data = getData();
  const index = data.coupons.findIndex(c => c.id === id);
  if (index !== -1) {
    data.coupons[index] = {
      ...data.coupons[index],
      is_active: updates.isActive !== undefined ? updates.isActive : data.coupons[index].is_active,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.coupons[index];
  }
  throw new Error('Coupon not found');
};

export const deleteCoupon = async (id) => {
  const data = getData();
  data.coupons = data.coupons.filter(c => c.id !== id);
  saveData(data);
  return true;
};

export const validateCoupon = async (code) => {
  const data = getData();
  const coupon = data.coupons.find(c => c.code === code && c.is_active);
  if (!coupon) throw new Error('Invalid coupon code');
  
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = new Date(coupon.valid_until);
  
  if (now < validFrom || now > validUntil) {
    throw new Error('Coupon has expired');
  }
  
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Coupon usage limit reached');
  }
  
  // Return mapped coupon with camelCase fields for frontend
  return {
    ...coupon,
    _id: coupon.id,
    discountType: coupon.discount_type,
    discountValue: parseFloat(coupon.discount_value) || 0,
    minOrderAmount: parseFloat(coupon.min_order_value) || 0,
    maxDiscountAmount: parseFloat(coupon.max_discount) || null,
    validFrom: coupon.valid_from,
    validUntil: coupon.valid_until,
    usageLimit: coupon.usage_limit,
    usedCount: coupon.used_count || coupon.usage_count || 0,
    isActive: coupon.is_active
  };
};

// ============ GALLERY ============
export const createGalleryImage = async (imageData) => {
  const data = getData();
  const imageId = generateId();
  const image = {
    id: imageId,
    table_type: 'gallery',
    url: imageData.url,
    title: imageData.title || '',
    description: imageData.description || '',
    category: imageData.category || 'general',
    is_featured: imageData.isFeatured || false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.gallery.push(image);
  saveData(data);
  return image;
};

export const getGalleryImages = async () => {
  const data = getData();
  return (data.gallery || []).map(img => ({
    ...img,
    _id: img.id,
    isFeatured: img.is_featured
  }));
};

export const updateGalleryImage = async (id, updates) => {
  const data = getData();
  const index = data.gallery.findIndex(g => g.id === id);
  if (index !== -1) {
    data.gallery[index] = {
      ...data.gallery[index],
      ...updates,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.gallery[index];
  }
  throw new Error('Gallery image not found');
};

export const deleteGalleryImage = async (id) => {
  const data = getData();
  data.gallery = data.gallery.filter(g => g.id !== id);
  saveData(data);
  return true;
};

// ============ REVIEWS ============
export const createReview = async (reviewData) => {
  const data = getData();
  const reviewId = generateId();
  const review = {
    id: reviewId,
    table_type: 'review',
    user_id: reviewData.userId,
    user_name: reviewData.userName || '',
    user_avatar: reviewData.userAvatar || '',
    menu_item_id: reviewData.menuItemId || '',
    rating: reviewData.rating,
    comment: reviewData.comment || '',
    is_verified: reviewData.isVerified || false,
    is_approved: reviewData.isApproved || false,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.reviews.push(review);
  saveData(data);
  return review;
};

export const getReviews = async () => {
  const data = getData();
  return (data.reviews || []).map(review => ({
    ...review,
    _id: review.id,
    userId: review.user_id,
    userName: review.user_name || review.userName,
    userAvatar: review.user_avatar,
    user: {
      name: review.user_name || review.userName || 'Customer',
      avatar: review.user_avatar || review.userAvatar
    },
    menuItemId: review.menu_item_id,
    isVerified: review.is_verified,
    isApproved: review.is_approved,
    isPublished: review.isPublished !== false,
    showOnHomepage: review.showOnHomepage || false,
    createdAt: review.created_at || review.createdAt
  }));
};

export const updateReview = async (id, updates) => {
  const data = getData();
  const index = data.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    data.reviews[index] = {
      ...data.reviews[index],
      is_approved: updates.isApproved !== undefined ? updates.isApproved : data.reviews[index].is_approved,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.reviews[index];
  }
  throw new Error('Review not found');
};

export const deleteReview = async (id) => {
  const data = getData();
  data.reviews = data.reviews.filter(r => r.id !== id);
  saveData(data);
  return true;
};

export const respondToReview = async (id, response) => {
  const data = getData();
  const index = data.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    data.reviews[index] = {
      ...data.reviews[index],
      adminResponse: {
        response: response,
        respondedAt: getTimestamp(),
        respondedBy: { name: 'Admin' }
      },
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.reviews[index];
  }
  throw new Error('Review not found');
};

// ============ FEATURES (About Section) ============
export const createFeature = async (featureData) => {
  const data = getData();
  const featureId = generateId();
  const feature = {
    id: featureId,
    table_type: 'feature',
    icon: featureData.icon,
    title: featureData.title,
    description: featureData.description,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.features.push(feature);
  saveData(data);
  return feature;
};

export const getFeatures = async () => {
  const data = getData();
  return (data.features || []).map(f => ({ ...f, _id: f.id }));
};

export const updateFeature = async (id, updates) => {
  const data = getData();
  const index = data.features.findIndex(f => f.id === id);
  if (index !== -1) {
    data.features[index] = {
      ...data.features[index],
      ...updates,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.features[index];
  }
  throw new Error('Feature not found');
};

export const deleteFeature = async (id) => {
  const data = getData();
  data.features = data.features.filter(f => f.id !== id);
  saveData(data);
  return true;
};

// ============ TEAM ============
export const createTeamMember = async (memberData) => {
  const data = getData();
  const memberId = generateId();
  const member = {
    id: memberId,
    table_type: 'team',
    name: memberData.name,
    role: memberData.role,
    bio: memberData.bio || '',
    image: memberData.image || '',
    social_twitter: memberData.social?.twitter || '',
    social_facebook: memberData.social?.facebook || '',
    social_instagram: memberData.social?.instagram || '',
    social_linkedin: memberData.social?.linkedin || '',
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.team.push(member);
  saveData(data);
  return member;
};

export const getTeamMembers = async () => {
  const data = getData();
  return (data.team || []).map(member => ({
    ...member,
    _id: member.id,
    social: {
      twitter: member.social_twitter,
      facebook: member.social_facebook,
      instagram: member.social_instagram,
      linkedin: member.social_linkedin
    }
  }));
};

export const updateTeamMember = async (id, updates) => {
  const data = getData();
  const index = data.team.findIndex(t => t.id === id);
  if (index !== -1) {
    data.team[index] = {
      ...data.team[index],
      ...updates,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.team[index];
  }
  throw new Error('Team member not found');
};

export const deleteTeamMember = async (id) => {
  const data = getData();
  data.team = data.team.filter(t => t.id !== id);
  saveData(data);
  return true;
};

// ============ ABOUT/CONTACT CONTENT ============
export const updateAboutContent = async (content) => {
  const data = getData();
  if (!data.about || !Array.isArray(data.about) || data.about.length === 0) {
    data.about = [{
      id: 'about001',
      table_type: 'about',
      created_at: getTimestamp()
    }];
  }
  
  data.about[0] = {
    ...data.about[0],
    title: content.title || data.about[0].title || '',
    heading: content.heading || data.about[0].heading || '',
    description: content.description || data.about[0].description || '',
    content: content.content || data.about[0].content || '',
    image: content.image || data.about[0].image || '',
    mission_title: content.missionTitle || data.about[0].mission_title || '',
    mission_text: content.missionText || data.about[0].mission_text || '',
    vision_title: content.visionTitle || data.about[0].vision_title || '',
    vision_text: content.visionText || data.about[0].vision_text || '',
    years_in_business: content.yearsInBusiness !== undefined ? content.yearsInBusiness : data.about[0].years_in_business || 0,
    happy_customers: content.happyCustomers !== undefined ? content.happyCustomers : data.about[0].happy_customers || 0,
    menu_items: content.menuItems !== undefined ? content.menuItems : data.about[0].menu_items || 0,
    awards: content.awards !== undefined ? content.awards : data.about[0].awards || 0,
    hero_title: content.title || data.about[0].hero_title || '',
    hero_subtitle: content.subtitle || data.about[0].hero_subtitle || '',
    hero_description: content.description || data.about[0].hero_description || '',
    hero_background_image: content.backgroundImage || data.about[0].hero_background_image || '',
    hero_primary_button_text: content.primaryButtonText || data.about[0].hero_primary_button_text || '',
    hero_primary_button_link: content.primaryButtonLink || data.about[0].hero_primary_button_link || '',
    hero_secondary_button_text: content.secondaryButtonText || data.about[0].hero_secondary_button_text || '',
    hero_secondary_button_link: content.secondaryButtonLink || data.about[0].hero_secondary_button_link || '',
    hero_is_active: content.isActive !== undefined ? content.isActive : data.about[0].hero_is_active !== false,
    updated_at: getTimestamp()
  };
  saveData(data);
  return data.about[0];
};

export const getAboutContent = async () => {
  const data = getData();
  const about = (data.about && Array.isArray(data.about) && data.about.length > 0) ? data.about[0] : {};
  return {
    _id: about.id,
    id: about.id,
    title: about.title || about.hero_title || '',
    heading: about.heading || '',
    description: about.description || about.hero_description || '',
    content: about.content || '',
    image: about.image || '',
    missionTitle: about.mission_title || '',
    missionText: about.mission_text || '',
    visionTitle: about.vision_title || '',
    visionText: about.vision_text || '',
    yearsInBusiness: about.years_in_business || 0,
    happyCustomers: about.happy_customers || 0,
    menuItems: about.menu_items || 0,
    awards: about.awards || 0,
    subtitle: about.hero_subtitle || '',
    backgroundImage: about.hero_background_image || '',
    primaryButtonText: about.hero_primary_button_text || '',
    primaryButtonLink: about.hero_primary_button_link || '',
    secondaryButtonText: about.hero_secondary_button_text || '',
    secondaryButtonLink: about.hero_secondary_button_link || '',
    isActive: about.hero_is_active !== false
  };
};

export const updateContactInfo = async (contact) => {
  const data = getData();
  if (!data.contact || !Array.isArray(data.contact) || data.contact.length === 0) {
    data.contact = [{
      id: 'contact001',
      table_type: 'contact',
      created_at: getTimestamp()
    }];
  }
  
  data.contact[0] = {
    ...data.contact[0],
    address_street: contact.addressStreet || contact.address?.street || data.contact[0].address_street || '',
    address_city: contact.addressCity || contact.address?.city || data.contact[0].address_city || '',
    address_state: contact.addressState || contact.address?.state || data.contact[0].address_state || '',
    address_zipcode: contact.addressZipcode || contact.address?.zipcode || data.contact[0].address_zipcode || '',
    address_country: contact.addressCountry || contact.address?.country || data.contact[0].address_country || '',
    phone: contact.phone || data.contact[0].phone || '',
    email: contact.email || data.contact[0].email || '',
    opening_hours: contact.openingHours ? JSON.stringify(contact.openingHours) : data.contact[0].opening_hours || '',
    map_latitude: contact.mapLatitude || data.contact[0].map_latitude || 0,
    map_longitude: contact.mapLongitude || data.contact[0].map_longitude || 0,
    social_facebook: contact.socialFacebook || contact.social?.facebook || data.contact[0].social_facebook || '',
    social_instagram: contact.socialInstagram || contact.social?.instagram || data.contact[0].social_instagram || '',
    social_twitter: contact.socialTwitter || contact.social?.twitter || data.contact[0].social_twitter || '',
    social_linkedin: contact.socialLinkedin || contact.social?.linkedin || data.contact[0].social_linkedin || '',
    updated_at: getTimestamp()
  };
  saveData(data);
  return data.contact[0];
};

export const getContactInfo = async () => {
  const data = getData();
  const contact = (data.contact && Array.isArray(data.contact) && data.contact.length > 0) ? data.contact[0] : {};
  return {
    _id: contact.id,
    addressStreet: contact.address_street || '',
    addressCity: contact.address_city || '',
    addressState: contact.address_state || '',
    addressZipcode: contact.address_zipcode || '',
    addressCountry: contact.address_country || '',
    phone: contact.phone || '',
    email: contact.email || '',
    openingHours: contact.opening_hours ? JSON.parse(contact.opening_hours) : {},
    mapLatitude: contact.map_latitude || 0,
    mapLongitude: contact.map_longitude || 0,
    socialFacebook: contact.social_facebook || '',
    socialInstagram: contact.social_instagram || '',
    socialTwitter: contact.social_twitter || '',
    socialLinkedin: contact.social_linkedin || ''
  };
};

// ============ SITE SETTINGS ============
export const getSiteSettings = async () => {
  const data = getData();
  const settings = data.siteSettings || {};
  return {
    siteName: settings.siteName || '',
    logo: settings.logo || '',
    favicon: settings.favicon || '',
    primaryColor: settings.primaryColor || '#3b82f6',
    secondaryColor: settings.secondaryColor || '#8b5cf6',
    accentColor: settings.accentColor || '#ec4899',
    footerText: settings.footerText || '',
    announcementBar: settings.announcementBar || {
      enabled: false,
      message: '',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    },
    maintenanceMode: settings.maintenanceMode || {
      enabled: false,
      message: 'We are currently under maintenance. Please check back soon.'
    },
    googleAnalyticsId: settings.googleAnalyticsId || '',
    facebookPixelId: settings.facebookPixelId || ''
  };
};

export const updateSiteSettings = async (settings) => {
  const data = getData();
  data.siteSettings = {
    siteName: settings.siteName,
    logo: settings.logo,
    favicon: settings.favicon,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    footerText: settings.footerText,
    announcementBar: settings.announcementBar,
    maintenanceMode: settings.maintenanceMode,
    googleAnalyticsId: settings.googleAnalyticsId,
    facebookPixelId: settings.facebookPixelId,
    updated_at: getTimestamp()
  };
  saveData(data);
  return data.siteSettings;
};

// Today's Offers Functions
export const getTodaysOffers = async () => {
  const data = getData();
  return (data.todaysOffers || []).map(offer => ({
    ...offer,
    _id: offer.id
  }));
};

export const createTodaysOffer = async (offerData) => {
  const data = getData();
  const newOffer = {
    id: generateId(),
    ...offerData,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
  data.todaysOffers = data.todaysOffers || [];
  data.todaysOffers.push(newOffer);
  saveData(data);
  return newOffer;
};

export const updateTodaysOffer = async (id, offerData) => {
  const data = getData();
  data.todaysOffers = data.todaysOffers || [];
  const index = data.todaysOffers.findIndex(o => o.id === id);
  if (index !== -1) {
    data.todaysOffers[index] = {
      ...data.todaysOffers[index],
      ...offerData,
      updated_at: getTimestamp()
    };
    saveData(data);
    return data.todaysOffers[index];
  }
  throw new Error('Offer not found');
};

export const deleteTodaysOffer = async (id) => {
  const data = getData();
  data.todaysOffers = data.todaysOffers || [];
  data.todaysOffers = data.todaysOffers.filter(o => o.id !== id);
  saveData(data);
  return { message: 'Offer deleted successfully' };
};

export const toggleTodaysOffer = async (id) => {
  const data = getData();
  data.todaysOffers = data.todaysOffers || [];
  const index = data.todaysOffers.findIndex(o => o.id === id);
  if (index !== -1) {
    data.todaysOffers[index].isActive = !data.todaysOffers[index].isActive;
    data.todaysOffers[index].updated_at = getTimestamp();
    saveData(data);
    return data.todaysOffers[index];
  }
  throw new Error('Offer not found');
};

// ============ CONTACT MESSAGES ============
export const getContactMessages = async () => {
  const data = getData();
  return (data.contactMessages || []).map(msg => ({
    ...msg,
    _id: msg.id
  }));
};

export const createContactMessage = async (messageData) => {
  const data = getData();
  data.contactMessages = data.contactMessages || [];
  const newMessage = {
    id: generateId(),
    name: messageData.name,
    email: messageData.email,
    message: messageData.message,
    status: 'unread',
    replied: false,
    replyMessage: null,
    repliedAt: null,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  data.contactMessages.unshift(newMessage);
  saveData(data);
  return newMessage;
};

export const updateContactMessage = async (id, updates) => {
  const data = getData();
  data.contactMessages = data.contactMessages || [];
  const index = data.contactMessages.findIndex(m => m.id === id);
  if (index !== -1) {
    data.contactMessages[index] = {
      ...data.contactMessages[index],
      ...updates,
      updatedAt: getTimestamp()
    };
    if (updates.status === 'replied' && updates.replyMessage) {
      data.contactMessages[index].replied = true;
      data.contactMessages[index].repliedAt = getTimestamp();
    }
    saveData(data);
    return data.contactMessages[index];
  }
  throw new Error('Message not found');
};

export const deleteContactMessage = async (id) => {
  const data = getData();
  data.contactMessages = data.contactMessages || [];
  data.contactMessages = data.contactMessages.filter(m => m.id !== id);
  saveData(data);
  return { message: 'Message deleted successfully' };
};

// ============ TOGGLE FUNCTIONS ============
export const toggleMenuItemHomepage = async (id) => {
  const data = getData();
  const index = data.menu.findIndex(item => item.id === id);
  if (index !== -1) {
    data.menu[index].showOnHomepage = !data.menu[index].showOnHomepage;
    data.menu[index].updated_at = getTimestamp();
    saveData(data);
    return data.menu[index];
  }
  throw new Error('Menu item not found');
};

export const toggleReviewHomepage = async (id) => {
  const data = getData();
  data.reviews = data.reviews || [];
  const index = data.reviews.findIndex(review => review.id === id);
  if (index !== -1) {
    data.reviews[index].showOnHomepage = !data.reviews[index].showOnHomepage;
    data.reviews[index].updated_at = getTimestamp();
    saveData(data);
    return data.reviews[index];
  }
  throw new Error('Review not found');
};

export const toggleReviewPublish = async (id) => {
  const data = getData();
  data.reviews = data.reviews || [];
  const index = data.reviews.findIndex(review => review.id === id);
  if (index !== -1) {
    data.reviews[index].isPublished = !data.reviews[index].isPublished;
    data.reviews[index].updated_at = getTimestamp();
    saveData(data);
    return data.reviews[index];
  }
  throw new Error('Review not found');
};

export const toggleTeamMemberAbout = async (id) => {
  const data = getData();
  data.team = data.team || [];
  const index = data.team.findIndex(member => member.id === id);
  if (index !== -1) {
    data.team[index].showInAbout = !data.team[index].showInAbout;
    data.team[index].updated_at = getTimestamp();
    saveData(data);
    return data.team[index];
  }
  throw new Error('Team member not found');
};

// Initialize on module load
initializeData();
