const bcrypt = require('bcrypt');
const db = require('../config/db');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node src/scripts/generate-hash.js <password>');
  process.exit(1);
}

const password = args[0];
const SALT_ROUNDS = 10;

(async () => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(`\nPassword: ${password}`);
    console.log(`Hash:     ${hash}\n`);
    console.log(`SQL to update user 'LONDON':`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'LONDON';\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
})();
