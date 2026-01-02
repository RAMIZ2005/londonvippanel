const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate Access Token
 * @param {object} payload 
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

/**
 * Generate Refresh Token
 * @param {object} payload 
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
};

/**
 * Generate a cryptographically secure license key
 * Format: XXXX-XXXX-XXXX-XXXX
 * @returns {string}
 */
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  let key = '';
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length)); // Simple random is okay for non-critical, but crypto is better
    }
    // Using crypto for better randomness
    segment = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 4);
    key += segment;
    if (i < segments - 1) key += '-';
  }
  return key;
};

/**
 * Sign data for Android response
 * @param {object} data 
 * @returns {string} Signed JWT
 */
const signResponse = (data) => {
    // In a real scenario, you might use a private key (RSA) for signing 
    // so the app can verify with a public key. 
    // Here we use the shared secret for simplicity as requested "Signed JSON response"
    // Ideally, for Android, you'd use RS256.
    return jwt.sign(data, process.env.JWT_SECRET);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateLicenseKey,
  signResponse
};
