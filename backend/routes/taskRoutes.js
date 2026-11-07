const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');

router.use(protect); // All task routes require login

router.route('/')
    .get(getTasks)
    .post(createTask);

router.route('/:id/status')
    .put(updateTaskStatus);

module.exports = router;