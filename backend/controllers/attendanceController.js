const Attendance = require('../models/Attendance');

// @desc    Punch In
exports.punchIn = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let record = await Attendance.findOne({ user: req.user.id, date: today });

        if (!record) {
            record = new Attendance({ user: req.user.id, date: today, sessions: [] });
        }

        // Check if already punched in
        const activeSession = record.sessions.find(s => !s.punchOut);
        if (activeSession) {
            return res.status(400).json({ success: false, message: 'You are already punched in. Please punch out first.' });
        }

        record.sessions.push({ punchIn: Date.now() });
        await record.save();

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Punch Out
exports.punchOut = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let record = await Attendance.findOne({ user: req.user.id, date: today });

        if (!record) return res.status(404).json({ success: false, message: 'No attendance record found for today' });

        // Find the active session
        const activeSession = record.sessions.find(s => !s.punchOut);
        if (!activeSession) {
            return res.status(400).json({ success: false, message: 'You are not currently punched in.' });
        }

        activeSession.punchOut = Date.now();

        // Calculate total minutes for all completed sessions
        let totalMins = 0;
        record.sessions.forEach(session => {
            if (session.punchIn && session.punchOut) {
                const diff = new Date(session.punchOut) - new Date(session.punchIn);
                totalMins += Math.floor(diff / 1000 / 60); // convert ms to minutes
            }
        });
        record.totalMinutes = totalMins;

        await record.save();
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get today's status (for the current user)
exports.getTodayStatus = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({ user: req.user.id, date: today });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all attendance (For Director/HR)
exports.getAllAttendance = async (req, res) => {
    try {
        // Only Directors should hit this route (protected in routes file)
        const records = await Attendance.find().populate('user', 'name email role').sort({ date: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Delete today's attendance (For resets/mistakes)
exports.deleteTodayRecord = async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('en-CA');
        await Attendance.findOneAndDelete({ user: req.user.id, date: today });
        res.status(200).json({ success: true, message: 'Record deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};