const express = require('express');
const router = express.Router();

// 1. Make sure these functions are actually exported from authController.js
const {
    register,
    login,
    updateProfile,
    changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// 2. Public routes
router.post('/register', register);
router.post('/login', login);

// 3. Protected routes
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;