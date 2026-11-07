const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Prevents password from being returned in API responses
  },
  role: {
    type: String,
    enum: ['director', 'intern', 'client'],
    default: 'intern', // Default role if not specified
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);