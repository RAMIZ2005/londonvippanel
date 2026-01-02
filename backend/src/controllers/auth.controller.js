const db = require('../config/db');
const { comparePassword, hashPassword, generateAccessToken, generateRefreshToken } = require('../utils/security');
const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
  // Input Validation Error Handling
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Check if account is disabled
    if (user.status === 'disabled') {
        return res.status(403).json({ message: 'Account is disabled. Contact Owner.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Log login action
    await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
      ['LOGIN', user.id, `User ${user.username} logged in`, req.ip]);

    res.json({ accessToken, refreshToken, user: payload });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = (req, res) => {
  res.json({ user: req.user });
};

// Owner Only: Create Admin
exports.createAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    
    try {
        const hashedPassword = await hashPassword(password);
        
        await db.execute('INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)', 
            [username, hashedPassword, 'admin', 'enabled']);
            
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Owner Only: List Admins
exports.listAdmins = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, role, status, created_at FROM users WHERE role = "admin"');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Owner Only: Delete Admin
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ? AND role = "admin"', [id]);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Owner Only: Toggle Status
exports.toggleAdminStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // enabled or disabled
    
    if (!['enabled', 'disabled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await db.execute('UPDATE users SET status = ? WHERE id = ? AND role = "admin"', [status, id]);
        res.json({ message: `Admin ${status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
