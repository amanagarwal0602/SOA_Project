const fs = require('fs');
const path = require('path');

// Read the sampleDataFull.json file
const dataPath = path.join(__dirname, '../../public/sampleDataFull.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to generate realistic Indian restaurant prices (in INR)
function generateRealisticPrice(category) {
  const priceRanges = {
    'Pizza': { min: 199, max: 599 },
    'Burgers': { min: 149, max: 349 },
    'Pasta': { min: 179, max: 449 },
    'Salads': { min: 129, max: 299 },
    'Desserts': { min: 89, max: 249 },
    'Coffee': { min: 99, max: 249 },
    'Beverages': { min: 49, max: 179 },
    'Sandwiches': { min: 129, max: 299 },
    'Appetizers': { min: 149, max: 399 },
    'Main Course': { min: 249, max: 699 }
  };

  const range = priceRanges[category] || { min: 149, max: 399 };
  const price = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  // Round to nearest 9 or 49 for Indian pricing psychology
  if (price < 100) {
    return Math.floor(price / 10) * 10 - 1; // ends with 9
  } else if (price < 200) {
    return Math.floor(price / 50) * 50 - 1; // ends with 49 or 99
  } else {
    return Math.floor(price / 10) * 10 - 1; // ends with 9
  }
}

console.log('💰 Updating prices to realistic Indian restaurant prices...\n');

// Update menu items with realistic prices
let menuItemUpdates = 0;
data.menuItems = data.menuItems.map(item => {
  menuItemUpdates++;
  const newPrice = generateRealisticPrice(item.category);
  return {
    ...item,
    price: newPrice
  };
});

// Update orders with new prices
let orderUpdates = 0;
data.orders = data.orders.map(order => {
  orderUpdates++;
  
  let updatedItems = order.items;
  let newTotal = 0;
  
  if (typeof order.items === 'string') {
    try {
      const itemsArray = JSON.parse(order.items);
      const updatedItemsArray = itemsArray.map(item => {
        const menuItem = data.menuItems.find(m => m.id === item.menu_item_id || m.name === item.name);
        const newPrice = menuItem ? menuItem.price : generateRealisticPrice('Main Course');
        const newItemTotal = newPrice * item.quantity;
        newTotal += newItemTotal;
        return {
          ...item,
          price: newPrice,
          total: newItemTotal
        };
      });
      updatedItems = JSON.stringify(updatedItemsArray);
    } catch (e) {
      console.log('Could not parse items for order:', order.id);
    }
  } else if (Array.isArray(order.items)) {
    updatedItems = order.items.map(item => {
      const menuItem = data.menuItems.find(m => m.id === item.menu_item_id || m.name === item.name);
      const newPrice = menuItem ? menuItem.price : generateRealisticPrice('Main Course');
      const newItemTotal = newPrice * item.quantity;
      newTotal += newItemTotal;
      return {
        ...item,
        price: newPrice,
        total: newItemTotal
      };
    });
  }
  
  return {
    ...order,
    items: updatedItems,
    total: newTotal || order.total,
    totalPrice: newTotal || order.totalPrice,
    subtotal: newTotal || order.subtotal
  };
});

// Save the updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`✅ Updated ${menuItemUpdates} menu items with realistic Indian prices`);
console.log(`✅ Updated ${orderUpdates} orders\n`);
console.log(`💰 Sample realistic prices:`);
console.log(`   Pizza: ₹${data.menuItems.find(i => i.category === 'Pizza')?.price || '249-599'}`);
console.log(`   Burger: ₹${data.menuItems.find(i => i.category === 'Burgers')?.price || '149-349'}`);
console.log(`   Coffee: ₹${data.menuItems.find(i => i.category === 'Coffee')?.price || '99-249'}`);
console.log(`   Pasta: ₹${data.menuItems.find(i => i.category === 'Pasta')?.price || '179-449'}`);
console.log(`\n🎉 Successfully updated to realistic Indian restaurant prices!`);
console.log(`Updated file: ${dataPath}`);
