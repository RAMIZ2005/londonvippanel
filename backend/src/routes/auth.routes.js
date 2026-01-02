const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', [
  body('username').trim().notEmpty().escape(),
  body('password').trim().notEmpty()
], authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

// Admin Management Routes (Owner Only)
router.post('/admins', [
    authenticateToken, 
    requireRole('owner'),
    body('username').trim().notEmpty(),
    body('password').isLength({ min: 6 })
], authController.createAdmin);

router.get('/admins', authenticateToken, requireRole('owner'), authController.listAdmins);

router.delete('/admins/:id', authenticateToken, requireRole('owner'), authController.deleteAdmin);

router.patch('/admins/:id/status', authenticateToken, requireRole('owner'), authController.toggleAdminStatus);

module.exports = router;
