const db = require('../config/db');
const { generateLicenseKey } = require('../utils/security');
const { validationResult } = require('express-validator');

// Get all licenses
exports.getAllLicenses = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM licenses ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new license
exports.createLicense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { max_devices, expire_at, is_lifetime, allowed_package_name } = req.body;
  const licenseKey = generateLicenseKey();

  try {
    const [result] = await db.execute(
      'INSERT INTO licenses (license_key, max_devices, expire_at, is_lifetime, allowed_package_name) VALUES (?, ?, ?, ?, ?)',
      [licenseKey, max_devices, is_lifetime ? null : expire_at, is_lifetime, allowed_package_name || null]
    );

    await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
        ['CREATE_LICENSE', result.insertId, `Created license ${licenseKey}`, req.ip]);

    res.status(201).json({ id: result.insertId, license_key: licenseKey, max_devices, expire_at, is_lifetime, allowed_package_name, status: 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update license
exports.updateLicense = async (req, res) => {
    const { id } = req.params;
    const { max_devices, expire_at, is_lifetime, status, allowed_package_name } = req.body;
  
    try {
      await db.execute(
        'UPDATE licenses SET max_devices = ?, expire_at = ?, is_lifetime = ?, status = ?, allowed_package_name = ? WHERE id = ?',
        [max_devices, is_lifetime ? null : expire_at, is_lifetime, status, allowed_package_name || null, id]
      );

      await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
        ['UPDATE_LICENSE', id, `Updated license ${id}`, req.ip]);
  
      res.json({ message: 'License updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
};

// Delete license
exports.deleteLicense = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM licenses WHERE id = ?', [id]);
        await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
            ['DELETE_LICENSE', id, `Deleted license ${id}`, req.ip]);
        res.json({ message: 'License deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get devices for a license
exports.getLicenseDevices = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM devices WHERE license_id = ?', [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove a device
exports.removeDevice = async (req, res) => {
    const { id, deviceId } = req.params;
    try {
        await db.execute('DELETE FROM devices WHERE id = ? AND license_id = ?', [deviceId, id]);
        await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
            ['REMOVE_DEVICE', id, `Removed device ${deviceId} from license ${id}`, req.ip]);
        res.json({ message: 'Device removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
