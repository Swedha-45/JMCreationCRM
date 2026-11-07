const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../utils/sendEmail'); // Import Antigravity's tool

// @desc    Get all users (for dropdowns and HR directory)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const query = req.query.role ? { role: req.query.role } : {};
    // Exclude passwords from the response
    const users = await User.find(query).select('name email role createdAt');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite an Intern or Client
// @route   POST /api/users/invite
exports.inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // 1. Validation
    if (role === 'director') {
      return res.status(400).json({ success: false, message: 'Cannot invite another Director' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 2. Generate temporary password (e.g., Jm-a4f2b1!)
    const tempPassword = `Jm-${crypto.randomBytes(3).toString('hex')}!`;

    // 3. Hash the password for the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // 4. Create the user in MongoDB
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // 5. Send the Welcome Email using Antigravity's template
    let emailFailed = false;
    let emailErrorMessage = '';
    try {
      await sendWelcomeEmail(name, email, tempPassword);
      console.log(`✅ Welcome email successfully sent to ${email}`);
    } catch (emailError) {
      emailFailed = true;
      emailErrorMessage = emailError.message;
      // We log the error, but we DO NOT crash the request. 
      // The user was created successfully, which is the most important part.
      console.error(`❌ Failed to send email to ${email}:`, emailError.message);
    }

    // 6. Send response back to React
    res.status(201).json({
      success: true,
      emailFailed,
      message: emailFailed
        ? `Account created! Email dispatch failed (SMTP error: ${emailErrorMessage}), but here are the manual credentials to share:`
        : 'User created successfully.',
      credentials: { email: user.email, tempPassword } // We send this back just in case the email fails, the Director can still copy it
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Security check: Do not allow deleting a Director
    if (user.role === 'director') {
      return res.status(403).json({ success: false, message: 'Cannot delete a Director account' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Re-export profile management from authController for compatibility
const { updateProfile, changePassword } = require('./authController');
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;