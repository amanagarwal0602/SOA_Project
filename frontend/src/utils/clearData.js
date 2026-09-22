// Clear and reinitialize localStorage data
// Run this in browser console to reset all data

console.log('Clearing cafe data...');
localStorage.removeItem('cafe_data');
console.log('Data cleared! Reload the page to reinitialize with fresh sample data.');

// Or run this to see current data:
// console.log(JSON.parse(localStorage.getItem('cafe_data')));
