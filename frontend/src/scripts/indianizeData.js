const fs = require('fs');
const path = require('path');

// Read the sampleDataFull.json file
const dataPath = path.join(__dirname, '../../public/sampleDataFull.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Indian city names
const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Surat', 'Vadodara'];
const indianStates = ['MH', 'DL', 'KA', 'TG', 'TN', 'WB', 'MH', 'GJ', 'RJ', 'UP', 'PB', 'MP', 'MP', 'MH', 'GJ', 'GJ'];

// Indian street names
const indianStreets = ['MG Road', 'Brigade Road', 'Park Street', 'Residency Road', 'Commercial Street', 'Anna Salai', 'Linking Road', 'FC Road', 'SG Highway', 'MI Road'];

// Convert USD to INR (approximate rate: 1 USD = 83 INR)
const USD_TO_INR = 83;

// Function to convert price to Indian rupees
function convertToINR(usdPrice) {
  return Math.round(usdPrice * USD_TO_INR);
}

// Function to generate Indian phone number
function generateIndianPhone() {
  const prefixes = ['+91-98', '+91-99', '+91-97', '+91-96', '+91-95', '+91-94'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number.toString().substring(0, 8)}`;
}

// Function to generate Indian zipcode
function generateIndianZipcode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log('🇮🇳 Converting data to Indian format...\n');

// Update customers
let customerUpdates = 0;
data.customers = data.customers.map(customer => {
  const cityIndex = Math.floor(Math.random() * indianCities.length);
  customerUpdates++;
  return {
    ...customer,
    phone: generateIndianPhone(),
    address_street: `${Math.floor(Math.random() * 999) + 1} ${indianStreets[Math.floor(Math.random() * indianStreets.length)]}`,
    address_city: indianCities[cityIndex],
    address_state: indianStates[cityIndex],
    address_zipcode: generateIndianZipcode(),
    address_country: 'India'
  };
});

// Update menu items
let menuItemUpdates = 0;
data.menuItems = data.menuItems.map(item => {
  menuItemUpdates++;
  return {
    ...item,
    price: convertToINR(item.price)
  };
});

// Update orders
let orderUpdates = 0;
data.orders = data.orders.map(order => {
  orderUpdates++;
  
  // Parse and update items if they're in string format
  let updatedItems = order.items;
  if (typeof order.items === 'string') {
    try {
      const itemsArray = JSON.parse(order.items);
      updatedItems = JSON.stringify(itemsArray.map(item => ({
        ...item,
        price: convertToINR(item.price),
        total: convertToINR(item.total)
      })));
    } catch (e) {
      console.log('Could not parse items for order:', order.id);
    }
  } else if (Array.isArray(order.items)) {
    updatedItems = order.items.map(item => ({
      ...item,
      price: convertToINR(item.price || 0),
      total: convertToINR(item.total || 0)
    }));
  }
  
  return {
    ...order,
    items: updatedItems,
    total: convertToINR(order.total || 0),
    totalPrice: convertToINR(order.totalPrice || 0),
    subtotal: convertToINR(order.subtotal || 0),
    deliveryFee: order.deliveryFee ? convertToINR(order.deliveryFee) : 0,
    tax: order.tax ? convertToINR(order.tax) : 0
  };
});

// Update reservations if they exist
if (data.reservations && Array.isArray(data.reservations)) {
  data.reservations = data.reservations.map(reservation => ({
    ...reservation,
    phone: reservation.phone ? generateIndianPhone() : undefined
  }));
}

// Save the updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`✅ Updated ${customerUpdates} customers with Indian addresses and phone numbers`);
console.log(`✅ Updated ${menuItemUpdates} menu items with Indian prices (₹)`);
console.log(`✅ Updated ${orderUpdates} orders with Indian prices (₹)`);
console.log(`\n💰 Sample conversions (USD → INR):`);
console.log(`   $14.34 → ₹${convertToINR(14.34)}`);
console.log(`   $16.81 → ₹${convertToINR(16.81)}`);
console.log(`   $25.50 → ₹${convertToINR(25.50)}`);
console.log(`\n🎉 Successfully indianized all data!`);
console.log(`Updated file: ${dataPath}`);
