const db = require('../config/db');

// Get all devices (with license info)
exports.getAllDevices = async (req, res) => {
    try {
        const query = `
            SELECT d.*, l.license_key 
            FROM devices d 
            JOIN licenses l ON d.license_id = l.id 
            ORDER BY d.last_check_in DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM devices WHERE id = ?', [id]);
        
        await db.execute('INSERT INTO audit_logs (action, target_id, details, ip_address) VALUES (?, ?, ?, ?)', 
            ['DELETE_DEVICE', id, `Deleted device ${id}`, req.ip]);

        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
