const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createEvent, getEvents } = require('../controllers/eventController');

router.use(protect);
router.route('/').get(getEvents).post(createEvent);

module.exports = router;