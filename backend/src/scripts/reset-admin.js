const db = require('../config/db');
const { hashPassword } = require('../utils/security');

async function resetAdmin() {
    try {
        console.log('Connecting to database...');
        // Test connection by running a simple query
        await db.execute('SELECT 1');
        console.log('Database connected successfully.');

        const username = 'LONDON';
        const password = 'admin123';
        const hashedPassword = await hashPassword(password);

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length > 0) {
            console.log(`User ${username} found. Updating password...`);
            await db.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, username]);
            console.log('Password updated successfully.');
        } else {
            console.log(`User ${username} not found. Creating new admin...`);
            await db.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', 
                [username, hashedPassword, 'admin']);
            console.log('User created successfully.');
        }

        console.log('-----------------------------------');
        console.log(`Login credentials:`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\nCRITICAL ERROR: Could not connect to MySQL Database.');
            console.error('Please make sure your MySQL server (XAMPP/WAMP) is RUNNING.');
        }
        process.exit(1);
    }
}

resetAdmin();
