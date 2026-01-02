const express = require('express');
const { body } = require('express-validator');
const licenseController = require('../controllers/license.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', licenseController.getAllLicenses);

router.post('/', [
    requireRole('admin'),
    body('max_devices').isInt({ min: 1 }),
    body('is_lifetime').isBoolean(),
    body('allowed_package_name').optional().isString(),
    // expire_at is required if is_lifetime is false. Validation logic can be complex here or handled in controller.
    // We'll rely on controller logic or client-side valid input for simplicity in route definition, 
    // but strictly we should use a custom validator.
], licenseController.createLicense);

router.put('/:id', requireRole('admin'), licenseController.updateLicense);
router.delete('/:id', requireRole('admin'), licenseController.deleteLicense);

router.get('/:id/devices', licenseController.getLicenseDevices);
router.delete('/:id/devices/:deviceId', requireRole('admin'), licenseController.removeDevice);

module.exports = router;
