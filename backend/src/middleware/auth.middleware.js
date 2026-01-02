const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
    return (req, res, next) => {
        // Owner has access to everything
        if (req.user && req.user.role === 'owner') {
            return next();
        }
        
        // Admin access logic
        if (role === 'admin' && req.user && req.user.role === 'admin') {
            return next();
        }

        // Exact match for other roles
        if (req.user && req.user.role === role) {
            return next();
        }

        res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
    }
}

module.exports = { authenticateToken, requireRole };
