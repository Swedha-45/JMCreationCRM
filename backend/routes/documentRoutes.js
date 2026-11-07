const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateAndSaveDocument,
  getClientDocuments,
  viewDocumentPDF,
  deleteDocument,
} = require('../controllers/documentController');

router.use(protect);
router.post('/generate', generateAndSaveDocument);
router.get('/client/:clientId', getClientDocuments);
router.get('/:id/pdf', viewDocumentPDF);
router.delete('/:id', deleteDocument);

module.exports = router;
