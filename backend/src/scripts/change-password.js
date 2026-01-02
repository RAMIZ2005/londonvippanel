const db = require('../config/db');
const { hashPassword } = require('../utils/security');

async function changePassword() {
    try {
        console.log('Connecting to database...');
        await db.execute('SELECT 1');
        console.log('Database connected successfully.');

        const username = 'LONDON';
        const newPassword = 'Ramiz2005';
        const hashedPassword = await hashPassword(newPassword);

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length > 0) {
            console.log(`User ${username} found. Updating password and ensuring role is owner...`);
            // Update password and ensure role is owner
            await db.execute('UPDATE users SET password_hash = ?, role = ? WHERE username = ?', [hashedPassword, 'owner', username]);
            console.log('Password and role updated successfully.');
        } else {
            console.log(`User ${username} not found. Creating new owner...`);
            await db.execute('INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)', 
                [username, hashedPassword, 'owner', 'enabled']);
            console.log('User created successfully.');
        }

        console.log('-----------------------------------');
        console.log(`UPDATED CREDENTIALS:`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${newPassword}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

changePassword();
