// Generate sample data for localStorage
const fs = require('fs');
const path = require('path');

const now = new Date().toISOString();
const getTimestamp = () => new Date().toISOString();
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Generate 500+ customers
const generateCustomers = (count = 500) => {
  const customers = [];
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Jennifer', 'Robert', 'Linda', 'William', 'Patricia', 'Richard', 'Mary', 'Joseph', 'Barbara', 'Thomas', 'Susan', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Edward', 'Melissa', 'Ronald', 'Deborah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Washington Blvd', 'Park Ave', 'Broadway', 'Market St'];
  const cities = ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const createdDaysAgo = Math.floor(Math.random() * 365);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - createdDaysAgo);
    
    customers.push({
      id: `user${String(i + 100).padStart(5, '0')}`,
      table_type: 'user',
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      password: 'Customer@123',
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      role: 'customer',
      avatar: `https://images.unsplash.com/photo-${1494790108377 + i}?w=100`,
      address_street: `${Math.floor(Math.random() * 9999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
      address_city: cities[Math.floor(Math.random() * cities.length)],
      address_state: 'NY',
      address_zipcode: String(10000 + Math.floor(Math.random() * 9000)),
      address_country: 'USA',
      favorite_items: [],
      permissions: [],
      refresh_token: '',
      is_active: true,
      email_verified: true,
      created_at: createdDate.toISOString(),
      updated_at: now
    });
  }
  
  return customers;
};

// Generate 100 menu items
const generateMenuItems = () => {
  // Category-specific image URLs from Unsplash
  const categoryImages = {
    'Pizza': [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', // Margherita
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', // Pepperoni
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', // Veggie
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', // Meat Lovers
      'https://images.unsplash.com/photo-1590534047948-d0ba978fd623?w=400&h=300&fit=crop', // Hawaiian
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop', // BBQ Chicken
      'https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&h=300&fit=crop', // Four Cheese
      'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400&h=300&fit=crop', // Buffalo Chicken
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop', // Mediterranean
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', // White Pizza
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', // Pesto Chicken
      'https://images.unsplash.com/photo-1576458088443-04a19c5a9f99?w=400&h=300&fit=crop', // Mushroom Truffle
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop', // Spicy Italian
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96a47?w=400&h=300&fit=crop', // Seafood
      'https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=400&h=300&fit=crop'  // Supreme
    ],
    'Burgers': [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', // Classic
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop', // Cheeseburger
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', // Bacon
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop', // Mushroom Swiss
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', // BBQ
      'https://images.unsplash.com/photo-1525059696034-4967a729850e?w=400&h=300&fit=crop', // Veggie
      'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop', // Double
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', // Chicken
      'https://images.unsplash.com/photo-1592415499556-fa375a5a8c7c?w=400&h=300&fit=crop', // Turkey
      'https://images.unsplash.com/photo-1585238341710-4a1b0d139314?w=400&h=300&fit=crop', // Fish
      'https://images.unsplash.com/photo-1562059392-096320bccc7e?w=400&h=300&fit=crop', // Jalapeño
      'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop', // Blue Cheese
      'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?w=400&h=300&fit=crop', // Avocado
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop', // Breakfast
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'  // Hawaiian
    ],
    'Salads': [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', // Caesar
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', // Greek
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', // Garden
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop', // Cobb
      'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop', // Caprese
      'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop', // Chicken Caesar
      'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop', // Asian
      'https://images.unsplash.com/photo-1590777675863-c2f9944c3d14?w=400&h=300&fit=crop', // Spinach
      'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=300&fit=crop', // Quinoa
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop', // Tuna
      'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop', // Chef
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop', // Kale
      'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&h=300&fit=crop', // Fruit
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop', // Waldorf
      'https://images.unsplash.com/photo-1546069901-eacef0df6022?w=400&h=300&fit=crop'  // Nicoise
    ],
    'Pasta': [
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', // Carbonara
      'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', // Alfredo
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', // Arrabbiata
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', // Lasagna
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', // Marinara
      'https://images.unsplash.com/photo-1587740908075-9ea9479a011f?w=400&h=300&fit=crop', // Ravioli
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop', // Pesto
      'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop', // Mac & Cheese
      'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop', // Bolognese
      'https://images.unsplash.com/photo-1611599539913-4573865b83b3?w=400&h=300&fit=crop', // Aglio Olio
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', // Primavera
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', // Seafood
      'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', // Chicken Alfredo
      'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=400&h=300&fit=crop', // Vodka Sauce
      'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400&h=300&fit=crop'  // Mushroom
    ],
    'Coffee': [
      'https://images.unsplash.com/photo-1510591509098-f4fdc6df5bee?w=400&h=300&fit=crop', // Espresso
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', // Cappuccino
      'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop', // Latte
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop', // Americano
      'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop', // Mocha
      'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=300&fit=crop', // Macchiato
      'https://images.unsplash.com/photo-1612967214708-707cd5baf7e4?w=400&h=300&fit=crop', // Flat White
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', // Cortado
      'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', // Iced Coffee
      'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', // Cold Brew
      'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400&h=300&fit=crop', // Nitro
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop', // Irish Coffee
      'https://images.unsplash.com/photo-1568142097985-fb4fb7b0d149?w=400&h=300&fit=crop', // Affogato
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop', // Turkish
      'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop'  // Vietnamese
    ],
    'Desserts': [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', // Chocolate Cake
      'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop', // Cheesecake
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', // Tiramisu
      'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop', // Brownie
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', // Ice Cream
      'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop', // Apple Pie
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', // Lemon Tart
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', // Panna Cotta
      'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop', // Crème Brûlée
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop', // Profiteroles
      'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400&h=300&fit=crop', // Macarons
      'https://images.unsplash.com/photo-1602885431933-d696f61c7ce4?w=400&h=300&fit=crop', // Cannoli
      'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=300&fit=crop', // Churros
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop', // Flan
      'https://images.unsplash.com/photo-1586191639163-1bab7b0d8b8c?w=400&h=300&fit=crop'  // Bread Pudding
    ],
    'Sandwiches': [
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', // Club
      'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=300&fit=crop', // BLT
      'https://images.unsplash.com/photo-1626266061368-46a8f578ddd6?w=400&h=300&fit=crop', // Grilled Cheese
      'https://images.unsplash.com/photo-1553909489-ec2175ef3e4b?w=400&h=300&fit=crop', // Reuben
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop', // Italian Sub
      'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?w=400&h=300&fit=crop', // Philly Cheesesteak
      'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400&h=300&fit=crop', // Chicken Sandwich
      'https://images.unsplash.com/photo-1619740455993-9e42934c6486?w=400&h=300&fit=crop', // Tuna Melt
      'https://images.unsplash.com/photo-1603133872504-a03314e78dd9?w=400&h=300&fit=crop', // French Dip
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop', // Turkey Club
      'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=300&fit=crop', // Veggie Wrap
      'https://images.unsplash.com/photo-1607330289024-1aa6b8e49844?w=400&h=300&fit=crop', // Cuban
      'https://images.unsplash.com/photo-1592415499556-fa375a5a8c7c?w=400&h=300&fit=crop', // Caprese
      'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop', // Pulled Pork
      'https://images.unsplash.com/photo-1529424388874-e50e8e87aa5b?w=400&h=300&fit=crop'  // Meatball Sub
    ]
  };

  const categories = {
    'Pizza': ['Margherita', 'Pepperoni', 'Veggie Supreme', 'Meat Lovers', 'Hawaiian', 'BBQ Chicken', 'Four Cheese', 'Buffalo Chicken', 'Mediterranean', 'White Pizza', 'Pesto Chicken', 'Mushroom Truffle', 'Spicy Italian', 'Seafood Special', 'Supreme'],
    'Burgers': ['Classic Burger', 'Cheeseburger', 'Bacon Burger', 'Mushroom Swiss', 'BBQ Burger', 'Veggie Burger', 'Double Patty', 'Chicken Burger', 'Turkey Burger', 'Fish Burger', 'Spicy Jalapeño', 'Blue Cheese Burger', 'Avocado Burger', 'Breakfast Burger', 'Hawaiian Burger'],
    'Salads': ['Caesar Salad', 'Greek Salad', 'Garden Salad', 'Cobb Salad', 'Caprese Salad', 'Chicken Caesar', 'Asian Chicken', 'Spinach Salad', 'Quinoa Bowl', 'Tuna Salad', 'Chef Salad', 'Kale Salad', 'Fruit Salad', 'Waldorf Salad', 'Nicoise Salad'],
    'Pasta': ['Spaghetti Carbonara', 'Fettuccine Alfredo', 'Penne Arrabbiata', 'Lasagna', 'Linguine Marinara', 'Ravioli', 'Pesto Pasta', 'Mac and Cheese', 'Bolognese', 'Aglio Olio', 'Primavera', 'Seafood Pasta', 'Chicken Alfredo', 'Vodka Sauce Pasta', 'Mushroom Pasta'],
    'Coffee': ['Espresso', 'Cappuccino', 'Latte', 'Americano', 'Mocha', 'Macchiato', 'Flat White', 'Cortado', 'Iced Coffee', 'Cold Brew', 'Nitro Coffee', 'Irish Coffee', 'Affogato', 'Turkish Coffee', 'Vietnamese Coffee'],
    'Desserts': ['Chocolate Cake', 'Cheesecake', 'Tiramisu', 'Brownie', 'Ice Cream', 'Apple Pie', 'Lemon Tart', 'Panna Cotta', 'Crème Brûlée', 'Profiteroles', 'Macarons', 'Cannoli', 'Churros', 'Flan', 'Bread Pudding'],
    'Sandwiches': ['Club Sandwich', 'BLT', 'Grilled Cheese', 'Reuben', 'Italian Sub', 'Philly Cheesesteak', 'Chicken Sandwich', 'Tuna Melt', 'French Dip', 'Turkey Club', 'Veggie Wrap', 'Cuban Sandwich', 'Caprese Sandwich', 'Pulled Pork', 'Meatball Sub']
  };
  
  const menuItems = [];
  let itemCount = 0;
  
  for (const [category, items] of Object.entries(categories)) {
    items.forEach((itemName, idx) => {
      itemCount++;
      if (itemCount > 100) return;
      
      const basePrice = category === 'Coffee' ? 3.99 : category === 'Desserts' ? 6.99 : category === 'Pizza' ? 12.99 : category === 'Burgers' ? 9.99 : category === 'Pasta' ? 14.99 : 8.99;
      const price = basePrice + (Math.random() * 5);
      
      menuItems.push({
        id: `menu${String(itemCount).padStart(3, '0')}`,
        table_type: 'menu',
        name: itemName,
        description: `Delicious ${itemName.toLowerCase()} prepared fresh daily with premium ingredients`,
        price: parseFloat(price.toFixed(2)),
        category: category,
        image: categoryImages[category][idx],
        is_available: Math.random() > 0.1, // 90% available
        is_veg: ['Salads', 'Pasta', 'Pizza', 'Desserts'].includes(category) && Math.random() > 0.3,
        spicy_level: Math.floor(Math.random() * 4),
        ingredients: ['Premium ingredients', 'Fresh produce', 'Special sauce'],
        allergens: Math.random() > 0.5 ? ['Dairy', 'Gluten'] : ['Gluten'],
        nutrition_calories: 200 + Math.floor(Math.random() * 600),
        nutrition_protein: 10 + Math.floor(Math.random() * 30),
        nutrition_carbs: 20 + Math.floor(Math.random() * 50),
        nutrition_fat: 5 + Math.floor(Math.random() * 25),
        prep_time: 10 + Math.floor(Math.random() * 20),
        rating: 3.5 + Math.random() * 1.5,
        rating_count: Math.floor(Math.random() * 200),
        order_count: Math.floor(Math.random() * 500),
        created_at: now,
        updated_at: now
      });
    });
  }
  
  return menuItems;
};

// Generate 20+ orders per day for 30 days = 600 orders
// Also ensure every customer has at least $10 in purchases
const generateOrders = (menuItems, customers) => {
  const orders = [];
  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  const customerOrderMap = {}; // Track total spending per customer
  
  // First, generate regular orders
  for (let day = 0; day < 30; day++) {
    const ordersPerDay = 20 + Math.floor(Math.random() * 10); // 20-30 orders per day
    
    for (let i = 0; i < ordersPerDay; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - day);
      orderDate.setHours(8 + Math.floor(Math.random() * 14)); // 8 AM to 10 PM
      orderDate.setMinutes(Math.floor(Math.random() * 60));
      
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numItems = 1 + Math.floor(Math.random() * 4); // 1-4 items per order
      const orderItems = [];
      let totalPrice = 0;
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = 1 + Math.floor(Math.random() * 2);
        const itemTotal = menuItem.price * quantity;
        totalPrice += itemTotal;
        
        orderItems.push({
          menu_item_id: menuItem.id,
          name: menuItem.name,
          quantity: quantity,
          price: menuItem.price,
          total: parseFloat(itemTotal.toFixed(2))
        });
      }
      
      // Status distribution: today has varied statuses, recent days mostly delivered, old orders all delivered
      let status;
      if (day === 0) {
        // Today: 40% delivered, 20% ready, 20% preparing, 10% confirmed, 10% pending
        const rand = Math.random();
        if (rand < 0.4) status = 'delivered';
        else if (rand < 0.6) status = 'ready';
        else if (rand < 0.8) status = 'preparing';
        else if (rand < 0.9) status = 'confirmed';
        else status = 'pending';
      } else if (day <= 2) {
        // Last 2 days: mostly delivered with few ready
        status = Math.random() < 0.9 ? 'delivered' : 'ready';
      } else {
        // Older orders: all delivered with rare cancelled
        status = Math.random() < 0.98 ? 'delivered' : 'cancelled';
      }
      
      orders.push({
        id: `order${String(orders.length + 1).padStart(5, '0')}`,
        table_type: 'order',
        order_number: `ORD-${String(orders.length + 1).padStart(5, '0')}`,
        user_id: customer.id,
        user_name: customer.name,
        user_email: customer.email,
        user_phone: customer.phone,
        items: JSON.stringify(orderItems),
        total_price: parseFloat(totalPrice.toFixed(2)),
        delivery_address: `${customer.address_street}, ${customer.address_city}, ${customer.address_state} ${customer.address_zipcode}`,
        payment_method: ['card', 'cash', 'online'][Math.floor(Math.random() * 3)],
        payment_status: status === 'cancelled' ? 'failed' : 'paid',
        status: status,
        special_instructions: Math.random() > 0.7 ? 'Extra napkins please' : '',
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      });
      
      // Track customer spending
      if (!customerOrderMap[customer.id]) {
        customerOrderMap[customer.id] = 0;
      }
      if (status !== 'cancelled') {
        customerOrderMap[customer.id] += totalPrice;
      }
    }
  }
  
  // Now ensure every customer has at least $10 in purchases
  customers.forEach((customer, index) => {
    const currentSpending = customerOrderMap[customer.id] || 0;
    
    if (currentSpending < 10) {
      // Create an order to bring them up to at least $10
      const neededAmount = 10 - currentSpending;
      const orderItems = [];
      let totalPrice = 0;
      
      // Add items until we reach at least the needed amount
      while (totalPrice < neededAmount) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = 1;
        const itemTotal = menuItem.price * quantity;
        totalPrice += itemTotal;
        
        orderItems.push({
          menu_item_id: menuItem.id,
          name: menuItem.name,
          quantity: quantity,
          price: menuItem.price,
          total: parseFloat(itemTotal.toFixed(2))
        });
      }
      
      // Create order 5-25 days ago
      const daysAgo = 5 + Math.floor(Math.random() * 20);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(8 + Math.floor(Math.random() * 14));
      orderDate.setMinutes(Math.floor(Math.random() * 60));
      
      orders.push({
        id: `order${String(orders.length + 1).padStart(5, '0')}`,
        table_type: 'order',
        order_number: `ORD-${String(orders.length + 1).padStart(5, '0')}`,
        user_id: customer.id,
        user_name: customer.name,
        user_email: customer.email,
        user_phone: customer.phone,
        items: JSON.stringify(orderItems),
        total_price: parseFloat(totalPrice.toFixed(2)),
        delivery_address: `${customer.address_street}, ${customer.address_city}, ${customer.address_state} ${customer.address_zipcode}`,
        payment_method: ['card', 'cash', 'online'][Math.floor(Math.random() * 3)],
        payment_status: 'paid',
        status: 'delivered',
        special_instructions: '',
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      });
      
      // Update the customer's spending map
      customerOrderMap[customer.id] = (customerOrderMap[customer.id] || 0) + totalPrice;
    }
  });
  
  return orders;
};

console.log('Generating 500+ customers...');
const customers = generateCustomers(500);

console.log('Generating 100 menu items...');
const menuItems = generateMenuItems();

console.log('Generating 600+ orders (20/day for 30 days)...');
const orders = generateOrders(menuItems, customers);

console.log('\n📊 Sample Data Generated:');
console.log(`👥 Customers: ${customers.length}`);
console.log(`🍕 Menu Items: ${menuItems.length}`);
console.log(`📦 Orders: ${orders.length}`);

const output = {
  customers: customers.slice(0, 10), // First 10 for preview
  menuItems: menuItems.slice(0, 10), // First 10 for preview
  orders: orders.slice(0, 10), // First 10 for preview
  stats: {
    totalCustomers: customers.length,
    totalMenuItems: menuItems.length,
    totalOrders: orders.length,
    avgOrdersPerDay: (orders.length / 30).toFixed(1)
  }
};

console.log('\n✅ Data generation complete!');
console.log('\nYou can now copy this data to localStorage.js');
console.log('Full arrays saved to: sampleDataFull.json');

fs.writeFileSync(
  path.join(__dirname, 'sampleDataFull.json'),
  JSON.stringify({ customers, menuItems, orders }, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'sampleDataPreview.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n💾 Files created:');
console.log('- sampleDataFull.json (all data)');
console.log('- sampleDataPreview.json (preview)');
