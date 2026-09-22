const axios = require('axios');

const SHEETDB_API = 'https://sheetdb.io/api/v1/qfa6hx74jtnim';
const TEMP_PASSWORD = 'Password123!';

const looksHashed = (value) => typeof value === 'string' && value.startsWith('$2a$');

(async () => {
  try {
    console.log('🔎 Checking SheetDB users for hashed passwords...');
    const response = await axios.get(`${SHEETDB_API}/search?table_type=user`);
    const users = Array.isArray(response.data) ? response.data : [];

    const hashedUsers = users.filter((user) => looksHashed(user.password));
    if (!hashedUsers.length) {
      console.log('✅ No hashed passwords found. Nothing to update.');
      return;
    }

    for (const user of hashedUsers) {
      console.log(`   Updating user ${user.email} (${user.id})`);
      await axios.patch(`${SHEETDB_API}/id/${user.id}`, {
        password: TEMP_PASSWORD,
        updated_at: new Date().toISOString()
      });
    }

    console.log(`✅ Updated ${hashedUsers.length} user(s) to plain-text password '${TEMP_PASSWORD}'.`);
    console.log('   Ask affected users to reset their password from the Admin panel.');
  } catch (error) {
    console.error('❌ Failed to normalize user passwords:', error.response?.data || error.message);
    process.exitCode = 1;
  }
})();
