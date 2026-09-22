const axios = require('axios');

const SHEETDB_API = 'https://sheetdb.io/api/v1/qfa6hx74jtnim';

const sleep = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const deleteByTableType = async (tableType, filterFn = () => true) => {
  console.log(`🗑️  Cleaning existing ${tableType} records...`);
  try {
    const existing = await axios.get(`${SHEETDB_API}/search?table_type=${tableType}`);
    if (Array.isArray(existing.data) && existing.data.length) {
      for (const record of existing.data) {
        if (!filterFn(record)) continue;
        await axios.delete(`${SHEETDB_API}/id/${record.id}`);
        console.log(`   Deleted ${tableType} record: ${record.id}`);
        await sleep();
      }
    } else {
      console.log(`   No ${tableType} records to delete`);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`   No ${tableType} records found (404)`);
      return;
    }
    console.error(`   Failed to cleanup ${tableType}:`, error.response?.data || error.message);
    throw error;
  }
};

const seedSheetDB = async () => {
  console.log('🌱 Starting SheetDB seeding...');

  try {
    // Delete existing admin users to avoid duplicates
    console.log('🗑️  Cleaning up existing admin users...');
    try {
      const existingUsers = await axios.get(`${SHEETDB_API}/search?table_type=user&email=admin@lumierecafe.com`);
      if (existingUsers.data && existingUsers.data.length > 0) {
        for (const user of existingUsers.data) {
          await axios.delete(`${SHEETDB_API}/id/${user.id}`);
          console.log('   Deleted old admin user:', user.id);
          await sleep();
        }
      }
    } catch (error) {
      // Ignore 404 errors (no existing users)
      if (error.response?.status !== 404) {
        console.log('   No existing admin users found');
      }
    }

    // Remove previously seeded content tables to avoid duplicates
    const tablesToReset = ['menu_item', 'gallery', 'feature', 'hero_section', 'coupon'];
    for (const tableType of tablesToReset) {
      await deleteByTableType(tableType);
    }

    // 1. Create Admin User (plain text password for simplicity)
    const admin = {
      id: `user_${Date.now()}`,
      table_type: 'user',
      name: 'Admin User',
      email: 'admin@lumierecafe.com',
      password: 'Admin@123',
      phone: '',
      role: 'admin',
      avatar: '',
      address_street: '',
      address_city: '',
      address_state: '',
      address_zipcode: '',
      address_country: '',
      favorite_items: '[]',
      refresh_token: '',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await axios.post(SHEETDB_API, admin);
    console.log('✅ Created admin user');

    // 2. Create Menu Items
    const menuItems = [
      { name: 'Espresso', description: 'Rich and bold Italian espresso', price: 3.50, category: 'drinks', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400' },
      { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, category: 'drinks', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      { name: 'Croissant', description: 'Buttery French pastry', price: 3.00, category: 'breakfast', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
      { name: 'Avocado Toast', description: 'Sourdough with fresh avocado', price: 8.50, category: 'breakfast', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400' },
      { name: 'Caesar Salad', description: 'Crispy romaine with parmesan', price: 12.00, category: 'lunch', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
      { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with vegetables', price: 18.00, category: 'dinner', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 7.50, category: 'desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400' },
      { name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.50, category: 'desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
    ];

    for (const item of menuItems) {
      const menuItem = {
        id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        table_type: 'menu_item',
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        sub_category: '',
        image: item.image,
        ingredients: '[]',
        allergens: '[]',
        dietary_info: '[]',
        is_available: true,
        is_special: false,
        preparation_time: 15,
        calories: 0,
        serving_size: '',
        rating_average: 0,
        rating_count: 0,
        order_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await axios.post(SHEETDB_API, menuItem);
      await sleep(); // Rate limit
    }
    console.log('✅ Created menu items');

    // 3. Create Gallery Images
    const galleryImages = [
      { title: 'Café Interior', description: 'Modern and cozy atmosphere', category: 'interior', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', order: 1 },
      { title: 'Signature Coffee', description: 'Our specialty blend', category: 'food', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800', order: 2 },
      { title: 'Team Event', description: 'Celebrating our anniversary', category: 'events', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', order: 3 },
    ];

    for (const img of galleryImages) {
      const gallery = {
        id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        table_type: 'gallery',
        title: img.title,
        description: img.description,
        image: img.image,
        category: img.category,
        tags: '[]',
        is_published: true,
        order: img.order,
        uploaded_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await axios.post(SHEETDB_API, gallery);
      await sleep();
    }
    console.log('✅ Created gallery images');

    // 4. Create Hero Section
    const hero = {
      id: `hero_${Date.now()}`,
      table_type: 'hero_section',
      title: 'Welcome to Lumière Café',
      subtitle: 'Experience exceptional coffee and cuisine in an elegant atmosphere',
      background_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200',
      cta_text: 'View Menu',
      cta_link: '/menu',
      is_active: true,
      updated_at: new Date().toISOString()
    };
    await axios.post(SHEETDB_API, hero);
    console.log('✅ Created hero section');

    // 5. Create Features
    const features = [
      { icon: '☕', title: 'Premium Coffee', description: 'Artisan coffee beans sourced from the finest farms worldwide', order: 1 },
      { icon: '🍽️', title: 'Gourmet Cuisine', description: 'Fresh ingredients prepared by expert chefs daily', order: 2 },
      { icon: '⭐', title: 'Exceptional Service', description: 'Warm hospitality and attention to every detail', order: 3 },
      { icon: '🎨', title: 'Cozy Atmosphere', description: 'Modern design with a welcoming, comfortable vibe', order: 4 },
    ];

    for (const feat of features) {
      const feature = {
        id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        table_type: 'feature',
        icon: feat.icon,
        title: feat.title,
        description: feat.description,
        order: feat.order,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await axios.post(SHEETDB_API, feature);
      await sleep();
    }
    console.log('✅ Created features');

    // 6. Create Coupons
    const coupons = [
      { code: 'WELCOME10', description: 'Welcome discount - 10% off your first order', discountType: 'percentage', discountValue: 10, minOrderAmount: 20, days: 90, usageLimit: 100 },
      { code: 'SAVE20', description: 'Save $20 on orders above $100', discountType: 'fixed', discountValue: 20, minOrderAmount: 100, days: 60, usageLimit: null },
      { code: 'SUMMER25', description: 'Summer special - 25% off (max $50 discount)', discountType: 'percentage', discountValue: 25, minOrderAmount: 50, days: 30, usageLimit: 50, maxDiscount: 50 },
      { code: 'FREESHIP', description: 'Free shipping - $5 off delivery fee', discountType: 'fixed', discountValue: 5, minOrderAmount: 30, days: 45, usageLimit: null },
    ];

    for (const coup of coupons) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + coup.days);
      
      const coupon = {
        id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        table_type: 'coupon',
        code: coup.code,
        description: coup.description,
        discount_type: coup.discountType,
        discount_value: coup.discountValue,
        min_order_amount: coup.minOrderAmount,
        max_discount_amount: coup.maxDiscount || '',
        valid_from: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        usage_limit: coup.usageLimit || '',
        used_count: 0,
        is_active: true,
        applicable_categories: '[]',
        created_by: admin.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await axios.post(SHEETDB_API, coupon);
      await sleep();
    }
    console.log('✅ Created sample coupons');

    console.log('\n✅ SheetDB seeded successfully!');
    console.log('Admin credentials: admin@lumierecafe.com / Admin@123');
    console.log('Sample coupons: WELCOME10, SAVE20, SUMMER25, FREESHIP');

  } catch (error) {
    console.error('❌ Error seeding SheetDB:', error.response?.data || error.message);
  }
};

// Run the seed
seedSheetDB();
