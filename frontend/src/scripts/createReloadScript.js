const fs = require('fs');
const path = require('path');

// Read the updated sampleDataFull.json
const dataPath = path.join(__dirname, '../../public/sampleDataFull.json');
const updatedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Create a script that will be injected into the browser
const browserScript = `
// Clear existing data and load updated data with new prices
localStorage.removeItem('cafe_data');

const updatedData = ${JSON.stringify(updatedData)};

// Transform the data structure to match localStorage format
const cafeData = {
  users: updatedData.customers || [],
  menuItems: updatedData.menuItems || [],
  orders: updatedData.orders || [],
  reservations: updatedData.reservations || [],
  // Add other necessary data structures
  about: [{
    id: 'about001',
    table_type: 'about',
    hero_title: 'Welcome to Lumière Café',
    hero_subtitle: 'Where Every Moment is Illuminated',
    hero_description: 'Experience culinary excellence in an ambiance of warmth and elegance',
    hero_image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200',
    story_title: 'Our Story',
    story_content: 'Founded in 2020, Lumière Café brings together the finest ingredients and culinary expertise.',
    mission: 'To create unforgettable dining experiences',
    vision: 'To be the most beloved café in the community',
    values: 'Quality, Warmth, Excellence',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]
};

localStorage.setItem('cafe_data', JSON.stringify(cafeData));
console.log('✅ Data reloaded with updated Indian prices!');
console.log('📊 Menu items:', cafeData.menuItems.length);
console.log('💰 Sample prices:');
console.log('   Pizza: ₹' + cafeData.menuItems.find(i => i.category === 'Pizza')?.price);
console.log('   Burger: ₹' + cafeData.menuItems.find(i => i.category === 'Burgers')?.price);
console.log('   Coffee: ₹' + cafeData.menuItems.find(i => i.category === 'Coffee')?.price);
console.log('\\n🔄 Please refresh the page to see updated prices!');
`;

// Save the browser script
const outputPath = path.join(__dirname, '../../public/reloadData.js');
fs.writeFileSync(outputPath, browserScript);

console.log('✅ Created data reload script!');
console.log('📍 Location: client/public/reloadData.js');
console.log('\\n📋 To update the data in your browser:');
console.log('1. Open your browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste and run this command:');
console.log('\\n   fetch("/reloadData.js").then(r=>r.text()).then(eval)');
console.log('\\n4. Refresh the page');
console.log('\\nOR simply clear localStorage and refresh:');
console.log('   localStorage.clear(); location.reload();');
