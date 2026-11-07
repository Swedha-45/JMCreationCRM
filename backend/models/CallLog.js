const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true }, // e.g., "15 mins"
    notes: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);