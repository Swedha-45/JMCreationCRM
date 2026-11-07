const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. The Bouncer: Checks if a valid token exists
const protect = async (req, res, next) => {
  let token;

  // Check if token is in the headers (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer eyJhbGciOi..."
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      next(); // Token is valid, let them pass to the route
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// 2. The Role Checker: Restricts access based on role
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the 'protect' middleware above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user.role}) is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };