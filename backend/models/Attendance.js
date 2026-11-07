const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    punchIn: { type: Date, required: true },
    punchOut: { type: Date } // Can be null if currently punched in
});

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    sessions: [sessionSchema],
    totalMinutes: { type: Number, default: 0 } // Calculated total time
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);