const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendWelcomeEmail } = require('../utils/sendEmail');
const { getUsers, inviteUser } = require('../controllers/userController');
const { updateProfile, changePassword } = require('../controllers/authController');


// @desc    Get all users (with optional role query e.g. ?role=intern)
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Invite a new Intern and send credentials email
// @route   POST /api/users/invite
// @access  Private (Director Only)
router.post('/invite', protect, authorize('director'), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and email.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Check if user already exists
    let existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Generate random secure temporary password
    const tempPassword = `JM@${crypto.randomBytes(4).toString('hex')}!`;

    // Hash password for database storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create user in MongoDB
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || 'intern',
    });

    // Send Welcome Email with credentials
    let emailFailed = false;
    let emailErrorMessage = '';
    try {
      await sendWelcomeEmail(user.name, user.email, tempPassword);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      emailFailed = true;
      emailErrorMessage = emailError.message;
    }

    if (emailFailed) {
      return res.status(201).json({
        success: true,
        emailFailed: true,
        message: `Account created! Email dispatch failed (SMTP error: ${emailErrorMessage}), but here are the manual credentials to share:`,
        credentials: {
          email: user.email,
          tempPassword: tempPassword,
        },
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    res.status(201).json({
      success: true,
      emailFailed: false,
      message: `Invitation sent successfully to ${user.email}. They will receive their credentials shortly.`,
      credentials: {
        email: user.email,
        tempPassword: tempPassword,
      },
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while sending invitation.',
    });
  }
});
// ... existing routes ...
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
const { deleteUser } = require('../controllers/userController');

// ... existing routes ...
router.delete('/:id', deleteUser);

module.exports = router;
