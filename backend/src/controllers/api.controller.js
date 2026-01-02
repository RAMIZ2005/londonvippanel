const db = require('../config/db');
const { signResponse } = require('../utils/security');
const { validationResult } = require('express-validator');

exports.checkLicense = async (req, res) => {
    // 1. Input Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ valid: false, message: 'Invalid Request', error: errors.array() });
    }

    const { license_key, device_fingerprint, package_name, version } = req.body;

    try {
        // 2. Fetch License
        const [licenses] = await db.execute('SELECT * FROM licenses WHERE license_key = ?', [license_key]);
        
        if (licenses.length === 0) {
            return res.json(signResponse({ valid: false, message: 'License not found' }));
        }

        const license = licenses[0];

        // 3. Check Status
        if (license.status === 'blocked') {
            return res.json(signResponse({ valid: false, message: 'License is blocked' }));
        }

        // 3.1 Check Package Name (Anti-Crack)
        if (license.allowed_package_name && license.allowed_package_name !== package_name) {
             // Log suspicious attempt
             await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
                ['SUSPICIOUS_ACCESS', license.id, `Package Mismatch: ${package_name} (Expected: ${license.allowed_package_name})`, req.ip]);
             
             return res.json(signResponse({ valid: false, message: 'Invalid Application Package' }));
        }

        // 4. Check Expiration
        if (!license.is_lifetime && new Date(license.expire_at) < new Date()) {
            // Auto-update status to expired (optional, or just return expired)
            // For now, just return expired
            return res.json(signResponse({ valid: false, message: 'License expired' }));
        }

        // 5. Check Device Binding
        const [devices] = await db.execute('SELECT * FROM devices WHERE license_id = ?', [license.id]);
        
        const deviceMatch = devices.find(d => d.device_fingerprint === device_fingerprint);

        if (deviceMatch) {
            // Device is already bound. Update last_seen.
            await db.execute('UPDATE devices SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [deviceMatch.id]);
            return res.json(signResponse({ 
                valid: true, 
                message: 'License active', 
                expire_at: license.expire_at, 
                is_lifetime: license.is_lifetime 
            }));
        } else {
            // Device not bound. Check limit.
            if (devices.length >= license.max_devices) {
                return res.json(signResponse({ valid: false, message: 'Device limit reached' }));
            }

            // Bind new device
            await db.execute('INSERT INTO devices (license_id, device_fingerprint) VALUES (?, ?)', [license.id, device_fingerprint]);
            
            return res.json(signResponse({ 
                valid: true, 
                message: 'Device registered and license active',
                expire_at: license.expire_at, 
                is_lifetime: license.is_lifetime
            }));
        }

    } catch (error) {
        console.error('License Check Error:', error);
        // Do not expose internal server error details to client
        res.status(500).json({ valid: false, message: 'Server error' });
    }
};
