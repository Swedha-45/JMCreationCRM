const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Info
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Please add a contact person'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  gstId: {
    type: String,
    default: 'N/A',
  },
  address: {
    type: String,
    default: '',
  },

  // The Services Provided (Array of objects)
  services: [{
    serviceName: { type: String, required: true }, // e.g., "Website Development"
    personInCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Links to an Intern
    agreedPrice: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' }
  }],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);