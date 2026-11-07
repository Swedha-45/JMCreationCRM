const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addCallLog, getClientCalls, deleteCallLog } = require('../controllers/callController');

router.use(protect);
router.post('/', addCallLog);
router.get('/:clientId', getClientCalls);
router.delete('/:id', deleteCallLog);

module.exports = router;