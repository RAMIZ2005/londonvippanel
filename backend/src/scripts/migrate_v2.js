const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration v2...');
        const connection = await db.getConnection();

        // 1. Update Users Table Role
        try {
            // Modify column to support owner
            await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('owner', 'admin', 'support') DEFAULT 'admin'");
            console.log('Updated users role enum.');
        } catch (e) {
            console.log('Role enum might already be updated or error:', e.message);
        }

        // 2. Add Status to Users
        try {
            await connection.query("ALTER TABLE users ADD COLUMN status ENUM('enabled', 'disabled') DEFAULT 'enabled'");
            console.log('Added status to users.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding status to users:', e.message);
        }

        // 3. Add Package Name to Licenses
        try {
            await connection.query("ALTER TABLE licenses ADD COLUMN allowed_package_name VARCHAR(255) NULL");
            console.log('Added allowed_package_name to licenses.');
        } catch (e) {
             if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding allowed_package_name:', e.message);
        }
        
        // 4. Update LONDON to owner
        await connection.query("UPDATE users SET role = 'owner' WHERE username = 'LONDON'");
        console.log('Updated LONDON user to owner.');

        connection.release();
        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
