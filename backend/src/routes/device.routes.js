const express = require('express');
const deviceController = require('../controllers/device.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', deviceController.getAllDevices);
router.delete('/:id', requireRole('admin'), deviceController.deleteDevice);

module.exports = router;
