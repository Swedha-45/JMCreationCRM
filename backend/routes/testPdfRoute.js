const express = require('express');
const router = express.Router();
const { generateInvoicePDF } = require('../utils/generatePDF');

// Generate and stream PDF based on custom posted payload
router.post('/generate', (req, res) => {
  const { data, docType } = req.body || {};
  generateInvoicePDF(data, docType || 'invoice', res);
});

// Helper handler for download routes
const handleDownload = (req, res) => {
  const isPost = req.method === 'POST';
  const bodyData = isPost && req.body && req.body.data ? req.body.data : (isPost ? req.body : null);
  const docType = (req.body && req.body.docType) || req.query.type || 'proforma';

  if (bodyData && Object.keys(bodyData).length > 0) {
    if (req.params.id && !bodyData.docNumber) {
      bodyData.docNumber = req.params.id.startsWith('INV-') ? req.params.id : `INV-${req.params.id}`;
    }
    return generateInvoicePDF(bodyData, docType, res);
  }

  // Default / Mock / Query fallback
  const mockData = {
    docNumber: req.params.id
      ? (req.params.id.startsWith('INV-') ? req.params.id : `INV-${req.params.id}`)
      : 'PI - 03/2026-27',
    date: req.query.date || new Date().toLocaleDateString('en-GB'),
    clientName: req.query.clientName || 'A M Jain College',
    clientAddress:
      req.query.clientAddress ||
      '4th Floor Building No./Flat.: No.129, Road/Street, Plaza Centre, Chennai',
    clientGstin: req.query.clientGstin || '33AAAAA0000A1Z5',
    clientMobile: req.query.clientMobile || '9876543210',
    items: [
      {
        description: req.query.serviceName || 'CRM Tool Development',
        sacHsn: req.query.sacHsn || '998314',
        rate: Number(req.query.rate) || 10000,
        units: Number(req.query.units) || 1,
        days: Number(req.query.days) || 1,
        amount: Number(req.query.amount) || 10000,
      },
    ],
    totalInvoiceValue: Number(req.query.total) || 11800,
    discount: 0,
    bankName: 'HDFC Bank, Gingee Branch',
    accountNo: '50200012345678',
    ifsc: 'HDFC0001234',
  };

  generateInvoicePDF(mockData, docType, res);
};

// Dynamic download route by ID or query (handles both GET and POST)
router.all('/download', handleDownload);
router.all('/download/:id', handleDownload);

module.exports = router;
