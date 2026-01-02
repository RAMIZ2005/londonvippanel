const express = require('express');
const { body } = require('express-validator');
const apiController = require('../controllers/api.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for license check (prevent brute force)
const checkLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

router.post('/check', [
    checkLimiter,
    body('license_key').trim().notEmpty(),
    body('device_fingerprint').trim().notEmpty()
], apiController.checkLicense);

module.exports = router;
