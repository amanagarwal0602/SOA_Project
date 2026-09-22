const axios = require('axios');
const bcryptjs = require('bcryptjs');

const SHEETDB_API = 'https://sheetdb.io/api/v1/qfa6hx74jtnim';

// Email to reset password for
const EMAIL = 'amanagarwal0602@gmail.com';
const NEW_PASSWORD = 'Test@123';

async function resetPassword() {
  try {
    console.log('Searching for user:', EMAIL);
    
    // Get user by email
    const searchResponse = await axios.get(`${SHEETDB_API}/search?table_type=user&email=${EMAIL}`);
    const user = searchResponse.data[0];
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✓ User found:', user.name);
    console.log('User ID:', user.id);
    
    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(NEW_PASSWORD, salt);
    
    console.log('New password hash created');
    
    // Update password in SheetDB
    const updateResponse = await axios.patch(`${SHEETDB_API}/id/${user.id}`, {
      password: hashedPassword,
      updated_at: new Date().toISOString()
    });
    
    console.log('✅ Password reset successful!');
    console.log('\nNew credentials:');
    console.log('Email:', EMAIL);
    console.log('Password:', NEW_PASSWORD);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

resetPassword();
