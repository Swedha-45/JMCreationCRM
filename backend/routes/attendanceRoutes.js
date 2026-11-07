const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    punchIn,
    punchOut,
    getTodayStatus,
    getAllAttendance
} = require('../controllers/attendanceController');

// All routes require login
router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayStatus);
router.get('/my', getAllAttendance); // For now, we will use this for the personal history

// HR route (Director only)
router.get('/all', authorize('director'), getAllAttendance);

module.exports = router;