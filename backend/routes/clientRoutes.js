const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createClient, getClients, addService } = require('../controllers/clientController');

// All routes below are protected and strictly for Directors
router.use(protect);
router.use(authorize('director'));

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id/service')
  .put(addService);

module.exports = router;
