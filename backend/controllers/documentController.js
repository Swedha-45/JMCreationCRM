const Document = require('../models/Document');
const Client = require('../models/Client');
const { generateInvoicePDF } = require('../utils/generatePDF');
const numberToWords = require('number-to-words');

/**
 * Generates an invoice PDF, streams it directly to the response,
 * and saves the document record WITH the binary PDF buffer in MongoDB.
 */
exports.generateAndSaveDocument = async (req, res) => {
  try {
    const { templateType, invoiceData } = req.body;

    console.log("=== INCOMING INVOICE DATA ===");
    console.log("Client ID:", invoiceData?.clientId);
    console.log("Invoice No:", invoiceData?.invoiceNo);
    console.log("Items count:", invoiceData?.items?.length);

    if (!invoiceData?.clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required to save the document.' });
    }

    // 1. Determine docType for PDFKit
    let docType = 'invoice';
    if (templateType.includes('quotation')) docType = 'quotation';
    else if (templateType.includes('proforma')) docType = 'proforma';
    else if (templateType.includes('tax')) docType = 'tax_invoice';

    // Ensure templateType and amountInWords are attached
    invoiceData.templateType = templateType;
    try {
      invoiceData.amountInWords = numberToWords.toWords(Math.round(invoiceData.totalAmount || 0)) + " only";
    } catch {
      invoiceData.amountInWords = "";
    }

    // 2. Generate PDF stream to response while capturing the full binary Buffer
    const pdfBuffer = await generateInvoicePDF(invoiceData, docType, res);

    // 3. Save to MongoDB with pdfData buffer and full item metadata
    await Document.create({
      clientId: invoiceData.clientId,
      createdBy: req.user.id,
      templateType: templateType,
      invoiceNo: invoiceData.invoiceNo,
      date: invoiceData.date,
      items: invoiceData.items,
      totalAmount: invoiceData.totalAmount,
      paidAmount: invoiceData.paidAmount || 0,
      dueAmount: (invoiceData.totalAmount || 0) - (invoiceData.paidAmount || 0),
      discount: invoiceData.discount || 0,
      taxableValue: invoiceData.taxableValue || invoiceData.totalAmount || 0,
      cgst: invoiceData.cgst || 0,
      sgst: invoiceData.sgst || 0,
      clientName: invoiceData.clientName,
      clientAddress: invoiceData.clientAddress,
      clientGstin: invoiceData.clientGstin,
      clientMobile: invoiceData.clientMobile,
      pdfData: pdfBuffer,
      pdfContentType: 'application/pdf',
    });

  } catch (error) {
    console.error("❌ PDF GENERATION ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * Retrieves the list of saved documents for a specific client (excluding heavy pdfData).
 */
exports.getClientDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ clientId: req.params.clientId })
      .select('-pdfData')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Streams the saved PDF from the database by Document ID.
 * If pdfData was not previously stored, it regenerates and saves it to MongoDB.
 */
exports.viewDocumentPDF = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let pdfBuffer = doc.pdfData;

    // Check if stored pdfData is missing or contains the legacy corrupt color bug (-15.419)
    let needsRegen = !pdfBuffer || pdfBuffer.length === 0;
    if (!needsRegen && pdfBuffer) {
      try {
        const zlib = require('zlib');
        let pos = 0;
        while (true) {
          const sIdx = pdfBuffer.indexOf(Buffer.from('stream'), pos);
          if (sIdx === -1) break;
          let dStart = sIdx + 6;
          while (pdfBuffer[dStart] === 0x0d || pdfBuffer[dStart] === 0x0a) dStart++;
          const eIdx = pdfBuffer.indexOf(Buffer.from('endstream'), dStart);
          if (eIdx === -1) break;
          const slice = pdfBuffer.slice(dStart, eIdx);
          try {
            const unzipped = zlib.inflateSync(slice).toString('latin1');
            if (unzipped.includes('-15.419') || unzipped.includes('-13.36')) {
              needsRegen = true;
              break;
            }
          } catch (e) { }
          pos = eIdx + 9;
        }
      } catch (e) { }
    }

    // If doc was created previously without cached pdfData, or had corrupt color, regenerate and update MongoDB!
    if (needsRegen) {
      const client = await Client.findById(doc.clientId);

      let docType = 'invoice';
      const templateType = doc.templateType || 'jina_tax_invoice';
      if (templateType.includes('quotation')) docType = 'quotation';
      else if (templateType.includes('proforma')) docType = 'proforma';
      else if (templateType.includes('tax')) docType = 'tax_invoice';

      const invoiceData = {
        clientId: doc.clientId,
        invoiceNo: doc.invoiceNo,
        docNumber: doc.invoiceNo,
        date: doc.date,
        clientName: doc.clientName || client?.companyName || 'Valued Client',
        clientAddress: doc.clientAddress || client?.address || '',
        clientGstin: doc.clientGstin || client?.gstId || '',
        clientMobile: doc.clientMobile || client?.phone || '',
        items: doc.items && doc.items.length > 0 ? doc.items : [
          {
            description: 'Professional Services',
            amount: doc.totalAmount,
          },
        ],
        totalAmount: doc.totalAmount,
        paidAmount: doc.paidAmount || 0,
        discount: doc.discount || 0,
        taxableValue: doc.taxableValue || doc.totalAmount,
        cgst: doc.cgst || 0,
        sgst: doc.sgst || 0,
        templateType: templateType,
        amountInWords: numberToWords.toWords(Math.round(doc.totalAmount || 0)) + " only",
      };

      pdfBuffer = await generateInvoicePDF(invoiceData, docType, null);

      // Backfill pdfData into MongoDB document for instant future retrieval
      doc.pdfData = pdfBuffer;
      doc.pdfContentType = 'application/pdf';
      await doc.save();
    }

    const filename = `${doc.templateType}_${doc.invoiceNo || 'document'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);

  } catch (error) {
    console.error("❌ ERROR VIEWING PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
// @desc    Delete a document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};