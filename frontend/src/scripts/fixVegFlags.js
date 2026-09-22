const fs = require('fs');
const path = require('path');

// Read the sampleDataFull.json file
const dataPath = path.join(__dirname, '../../public/sampleDataFull.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// List of non-vegetarian keywords to check in item names
const nonVegKeywords = [
  'meat', 'chicken', 'beef', 'bacon', 'pork', 'sausage', 'pepperoni', 
  'salmon', 'tuna', 'seafood', 'shrimp', 'fish', 'steak', 'turkey',
  'lamb', 'mutton', 'prawn', 'crab', 'lobster', 'duck', 'ham'
];

// Function to check if item name contains non-veg keywords
function isNonVeg(name) {
  const lowerName = name.toLowerCase();
  return nonVegKeywords.some(keyword => lowerName.includes(keyword));
}

// Fix vegetarian flags in menu items
let fixedCount = 0;
data.menuItems = data.menuItems.map(item => {
  const shouldBeNonVeg = isNonVeg(item.name);
  
  // If item has non-veg keyword but is marked as veg, fix it
  if (shouldBeNonVeg && item.is_veg === true) {
    console.log(`Fixing: ${item.name} - marking as non-veg`);
    fixedCount++;
    return { ...item, is_veg: false };
  }
  
  return item;
});

// Save the updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Fixed ${fixedCount} menu items with incorrect vegetarian flags!`);
console.log(`Updated file: ${dataPath}`);
