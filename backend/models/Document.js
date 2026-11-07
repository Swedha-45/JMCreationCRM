const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    templateType: {
      type: String,
      required: true,
    }, // e.g., 'jina_tax_invoice', 'jina_proforma', 'jina_quotation', 'jm_proforma_1', 'jm_proforma_2'
    invoiceNo: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    items: [
      {
        description: String,
        sacHsn: String,
        rate: mongoose.Schema.Types.Mixed,
        units: mongoose.Schema.Types.Mixed,
        days: mongoose.Schema.Types.Mixed,
        amount: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxableValue: {
      type: Number,
      default: 0,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    clientName: {
      type: String,
    },
    clientAddress: {
      type: String,
    },
    clientGstin: {
      type: String,
    },
    clientMobile: {
      type: String,
    },
    // Binary PDF storage in database
    pdfData: {
      type: Buffer,
    },
    pdfContentType: {
      type: String,
      default: 'application/pdf',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
