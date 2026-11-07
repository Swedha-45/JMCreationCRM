const PDFDocument = require('pdfkit');
const numberToWords = require('number-to-words');
const fs = require('fs');
const path = require('path');

/**
 * Converts a numeric amount to capitalized English words with "Rupees Only".
 *
 * @param {number|string} amount
 * @returns {string}
 */
const convertAmountToWords = (amount) => {
  const num = Number(amount) || 0;
  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let words = numberToWords.toWords(integerPart);
  words = words
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  if (decimalPart > 0) {
    const decimalWords = numberToWords
      .toWords(decimalPart)
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `${words} Rupees and ${decimalWords} Paise Only`;
  }
  return `${words} Rupees Only`;
};

/**
 * Formats a number to Indian currency format without decimals (or with decimals if needed).
 */
const formatINR = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-IN');
};

/**
 * Generates an invoice/quotation PDF document matching the 5 exact reference templates.
 * Returns a Promise that resolves with the generated PDF Buffer, while also piping to res if provided.
 *
 * @param {Object} data Document and client metadata
 * @param {string} docType One of: 'quotation', 'proforma', 'tax_invoice', 'invoice'
 * @param {Object} [res=null] Express HTTP response stream (optional)
 * @returns {Promise<Buffer>}
 */
const generateInvoicePDF = (data = {}, docType = 'invoice', res = null) => {
  return new Promise((resolve, reject) => {
    try {
      const normalizedDocType = (docType || 'invoice').toLowerCase();

      // 1. Setup Document: A4 with 40pt margins
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => reject(err));

      // Pipe to response if res is provided
      if (res) {
        if (typeof res.setHeader === 'function') {
          res.setHeader('Content-Type', 'application/pdf');
          const filename = `${normalizedDocType}_${data.docNumber || data.invoiceNo || 'doc'}.pdf`;
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }
        doc.pipe(res);
      }

      // Page Dimensions & Bounds
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2; // 515.28
      const contentHeight = pageHeight - margin * 2; // 761.89
      const leftX = margin;
      const rightX = pageWidth - margin;

      // Draw thick outer border around the page
      doc.lineWidth(2).rect(leftX, margin, contentWidth, contentHeight).stroke();
      doc.lineWidth(1); // Reset to normal line width

      // Determine exact template variant
      const rawTemplate = (data.templateType || '').toLowerCase();
      const isJM =
        rawTemplate.startsWith('jm') ||
        (data.company && data.company.includes('JM')) ||
        (data.companyName && data.companyName.includes('JM Creations'));

      let templateType = 'jina_tax_invoice';
      if (isJM) {
        if (rawTemplate === 'jm_proforma_1') {
          templateType = 'jm_proforma_1';
        } else {
          templateType = 'jm_proforma_2';
        }
      } else {
        if (rawTemplate === 'jina_quotation' || normalizedDocType === 'quotation') {
          templateType = 'jina_quotation';
        } else if (rawTemplate === 'jina_proforma' || (normalizedDocType === 'proforma' && !isJM)) {
          templateType = 'jina_proforma';
        } else {
          templateType = 'jina_tax_invoice';
        }
      }

      const isQuotation = templateType === 'jina_quotation';

      // 2. Header
      const headerTopY = margin;
      const headerBottomY = 102;
      const logoBoxWidth = 75;
      const logoBoxRightX = leftX + logoBoxWidth; // 115

      if (isJM) {
        // JM Creations Header: Yellow background for logo box matching logo (#ffd255)
        doc.save();
        doc.rect(leftX, headerTopY, logoBoxWidth, headerBottomY - headerTopY).fill('#ffd255');
        doc.restore();

        const jmLogoPath = fs.existsSync('backend/assets/jm-logo.png')
          ? 'backend/assets/jm-logo.png'
          : (fs.existsSync('assets/jm-logo.png')
            ? 'assets/jm-logo.png'
            : (fs.existsSync(path.join(__dirname, '../assets/jm-logo.png'))
              ? path.join(__dirname, '../assets/jm-logo.png')
              : null));

        if (jmLogoPath) {
          try {
            // Well-padded, centered JM logo inside the yellow box
            doc.image(jmLogoPath, leftX + 6, headerTopY + 5, {
              fit: [logoBoxWidth - 12, (headerBottomY - headerTopY) - 10],
              align: 'center',
              valign: 'center',
            });
          } catch (err) { }
        }

        const headerTextX = logoBoxRightX;
        const headerTextWidth = rightX - logoBoxRightX;

        doc
          .font('Helvetica-Bold')
          .fontSize(12.5)
          .fillColor('#000000')
          .text('JM Creations', headerTextX, 50, { width: headerTextWidth, align: 'center' });

        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(
            'NO.3/6 NEW STREET,PERIYAGARAM,GINGEE,VILLUPURAM,TAMILNADU-604202',
            headerTextX,
            65,
            { width: headerTextWidth, align: 'center' }
          );

        const compMobile = data.companyMobile || '9042986355';
        const compEmail = data.companyEmail || 'contact@jmcreation.in';

        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(
            `Mobile No :${compMobile} | Mail ID:${compEmail}`,
            headerTextX,
            77,
            { width: headerTextWidth, align: 'center' }
          );
      } else {
        // JINA Groups Header: White logo box with logo image
        const jinaLogoPath = fs.existsSync('backend/assets/jina-logo.png')
          ? 'backend/assets/jina-logo.png'
          : (fs.existsSync('assets/jina-logo.png')
            ? 'assets/jina-logo.png'
            : (fs.existsSync(path.join(__dirname, '../assets/jina-logo.png'))
              ? path.join(__dirname, '../assets/jina-logo.png')
              : null));

        if (jinaLogoPath) {
          try {
            doc.image(jinaLogoPath, leftX, headerTopY, {
              fit: [logoBoxWidth, (headerBottomY - headerTopY)],
              align: 'center',
              valign: 'center',
            });
          } catch (err) { }
        }

        const headerTextX = logoBoxRightX;
        const headerTextWidth = rightX - logoBoxRightX;

        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#000000')
          .text(
            'JINA GROUPS OF COMPANY PRIVATE LIMITED ( Trading as JM Creations )',
            headerTextX,
            48,
            { width: headerTextWidth, align: 'center' }
          );

        // Darker bold company address
        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(
            'NO.3/6 NEW STREET,PERIYAGARAM,GINGEE,VILLUPURAM,TAMILNADU-604202',
            headerTextX,
            61,
            { width: headerTextWidth, align: 'center' }
          );

        // GST number directly on its own line below company address
        const companyGstin = data.companyGstin || '33AAHCJ5418R1Z2';
        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(
            `GSTIN: ${companyGstin}`,
            headerTextX,
            73,
            { width: headerTextWidth, align: 'center' }
          );

        const compMobile = data.companyMobile || '9042986355';
        const compEmail = data.companyEmail || 'jinagroupsofcompay.info@gmail.com';
        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(
            `Mobile No :${compMobile}  | Mail ID:${compEmail}`,
            headerTextX,
            85,
            { width: headerTextWidth, align: 'center' }
          );
      }

      // Draw vertical line separating the logo box from the company info
      doc.lineWidth(1).strokeColor('#000000');
      doc.moveTo(logoBoxRightX, headerTopY).lineTo(logoBoxRightX, headerBottomY).stroke();

      // Draw horizontal line below entire header
      doc.moveTo(leftX, headerBottomY).lineTo(rightX, headerBottomY).stroke();

      // 3. Client Info & Metadata
      const clientInfoTopY = headerBottomY + 7;

      if (isQuotation) {
        // Quotation Layout: Left side client info
        doc.font('Helvetica-Bold').fontSize(8.5).text('To :', 50, clientInfoTopY);
        doc.font('Helvetica-Bold').fontSize(8.5).text(data.clientName || 'A M Jain College', 50, clientInfoTopY + 12);
        doc.font('Helvetica').fontSize(8).text(`Address : ${data.clientAddress || ''}`, 50, clientInfoTopY + 24, { width: 350 });
        doc.font('Helvetica').fontSize(8).text(`Mobile No: ${data.clientMobile || ''}`, 50, clientInfoTopY + 38);
      } else {
        // Invoice Layout: Left Billed To, Right Invoice No & Date
        doc.font('Helvetica-Bold').fontSize(8.5).text('Billed To :', 50, clientInfoTopY);
        doc.font('Helvetica-Bold').fontSize(8.5).text(data.clientName || 'Valued Client', 50, clientInfoTopY + 12);
        doc.font('Helvetica').fontSize(8).text(`Address : ${data.clientAddress || ''}`, 50, clientInfoTopY + 24, { width: 280, height: 25, ellipsis: true });

        let gstinText = data.clientGstin ? (String(data.clientGstin).startsWith('GSTIN') ? data.clientGstin : `GSTIN: ${data.clientGstin}`) : 'GSTIN:';
        doc.font('Helvetica').fontSize(8).text(gstinText, 50, clientInfoTopY + 50);

        let mobileText = data.clientMobile ? (String(data.clientMobile).startsWith('Mobile') ? data.clientMobile : `Mobile No: ${data.clientMobile}`) : 'Mobile No:';
        doc.font('Helvetica').fontSize(8).text(mobileText, 50, clientInfoTopY + 62);

        const docNoVal = data.docNumber || data.invoiceNo || '01/2026-27';
        doc.font('Helvetica-Bold').fontSize(8.5).text(`Invoice No: ${docNoVal}`, 340, clientInfoTopY + 12, { width: 205, align: 'right' });
        doc.font('Helvetica').fontSize(8).text(`Date: ${data.date || new Date().toLocaleDateString('en-GB')}`, 340, clientInfoTopY + 26, { width: 205, align: 'right' });
      }

      // Horizontal line below Client Info
      const clientInfoBottomY = 180;
      doc.moveTo(leftX, clientInfoBottomY).lineTo(rightX, clientInfoBottomY).stroke();

      // 4. Document Title
      let docTitle = 'PROFORMA INVOICE';
      if (templateType === 'jina_quotation') docTitle = 'PRICE QUOTATION';
      else if (templateType === 'jina_tax_invoice') docTitle = 'TAX INVOICE';
      else if (templateType === 'jm_proforma_1') docTitle = 'PRO FORMA INVOICE';
      else if (templateType === 'jm_proforma_2' || templateType === 'jina_proforma') docTitle = 'PROFORMA INVOICE';

      const titleY = clientInfoBottomY + 6;
      doc
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text(docTitle, leftX, titleY, { width: contentWidth, align: 'center', underline: true });

      // Horizontal line below Document Title
      const titleBottomY = titleY + 16;
      doc.moveTo(leftX, titleBottomY).lineTo(rightX, titleBottomY).stroke();

      // 5. The Table Headers
      const tableHeaderY = titleBottomY;
      const tableHeaderHeight = 20;

      const cols = isQuotation
        ? [
          { label: 'DESCRIPTION', width: 215.28, align: 'center' },
          { label: 'UNITS', width: 60, align: 'center' },
          { label: 'RATE (P.U)', width: 80, align: 'center' },
          { label: 'DAYS', width: 60, align: 'center' },
          { label: 'AMOUNT(Rs.)', width: 100, align: 'center' },
        ]
        : [
          { label: 'DESCRIPTION', width: 255.28, align: 'center' },
          { label: 'SAC/HSN', width: 80, align: 'center' },
          { label: 'RATE', width: 80, align: 'center' },
          { label: 'AMOUNT(Rs.)', width: 100, align: 'center' },
        ];

      // Draw Table Headers
      let headerColX = leftX;
      doc.font('Helvetica-Bold').fontSize(8);
      cols.forEach((col) => {
        doc.text(col.label, headerColX, tableHeaderY + 6, {
          width: col.width,
          align: 'center',
        });
        headerColX += col.width;
      });

      // Line below Table Headers
      const tableRowsStartY = tableHeaderY + tableHeaderHeight;
      doc.moveTo(leftX, tableRowsStartY).lineTo(rightX, tableRowsStartY).stroke();

      // Prepare Items
      const items = Array.isArray(data.items) && data.items.length > 0
        ? data.items
        : [
          {
            description: data.description || (isJM ? 'Poster ( 30 nos )' : (isQuotation ? 'Stage - (40 x 50) with ramp (15 x 6)' : 'CRM Tool')),
            sacHsn: data.sacHsn || (isJM || isQuotation ? '' : (templateType === 'jina_proforma' ? '8517' : '9983')),
            units: data.units || '',
            rate: data.rate || '',
            days: data.days || (isQuotation ? 1 : ''),
            amount: data.amount !== undefined ? data.amount : (data.totalAmount || (isJM ? 3000 : (isQuotation ? 250000 : 10000))),
          },
        ];

      // Calculate Subtotals & Totals
      const subtotal = items.reduce((acc, item) => {
        if (item.amount !== undefined && item.amount !== null && item.amount !== '' && !isNaN(item.amount)) {
          return acc + Number(item.amount);
        }
        const rateVal = Number(item.rate || 0);
        const unitsVal = Number(item.units || 1);
        const daysVal = isQuotation ? Number(item.days || 1) : 1;
        return acc + rateVal * unitsVal * daysVal;
      }, 0);

      const discount = Number(data.discount || 0);
      const taxableValue = Math.max(0, subtotal - discount);
      const cgst = taxableValue * 0.09;
      const sgst = taxableValue * 0.09;
      const paid = Number(data.paid || data.paidAmount || 0);
      const due = Math.max(0, taxableValue - paid);

      let totalInvoiceValue = subtotal;
      if (templateType === 'jina_tax_invoice' || templateType === 'jina_proforma') {
        totalInvoiceValue = taxableValue + cgst + sgst;
      } else if (templateType === 'jm_proforma_1') {
        totalInvoiceValue = taxableValue;
      } else {
        totalInvoiceValue = subtotal;
      }

      if (data.totalAmount !== undefined && data.totalAmount !== null && !isNaN(data.totalAmount)) {
        totalInvoiceValue = Number(data.totalAmount);
      }

      // Draw Data Rows
      let currentRowY = tableRowsStartY;

      // Determine row height and font size dynamically to fit all items cleanly
      const itemCount = items.length;
      const rowHeight = isQuotation
        ? (itemCount > 22 ? 11.5 : (itemCount > 14 ? 13 : 15))
        : (itemCount > 6 ? 16 : 20);
      const itemFontSize = isQuotation
        ? (itemCount > 22 ? 6.5 : (itemCount > 14 ? 7 : 7.5))
        : 7.5;

      items.forEach((item) => {
        let colX = leftX;

        const rateVal = item.rate !== undefined && item.rate !== null && item.rate !== '' && !isNaN(item.rate)
          ? Number(item.rate)
          : '';
        const unitsVal = item.units !== undefined && item.units !== null && item.units !== ''
          ? String(item.units)
          : '';
        const daysVal = item.days !== undefined && item.days !== null && item.days !== ''
          ? String(item.days)
          : '';

        let amountVal = '';
        if (item.amount !== undefined && item.amount !== null && item.amount !== '' && !isNaN(item.amount)) {
          amountVal = Number(item.amount);
        } else if (typeof rateVal === 'number' && rateVal > 0) {
          amountVal = rateVal * (Number(unitsVal) || 1) * (isQuotation ? (Number(daysVal) || 1) : 1);
        }

        const values = isQuotation
          ? [
            item.description || item.name || '',
            unitsVal,
            typeof rateVal === 'number' ? formatINR(rateVal) : '',
            daysVal,
            typeof amountVal === 'number' ? formatINR(amountVal) : '',
          ]
          : [
            item.description || item.name || '',
            item.sacHsn || item.sac || item.hsn || '',
            typeof rateVal === 'number' ? formatINR(rateVal) : '',
            typeof amountVal === 'number' ? formatINR(amountVal) : '',
          ];

        doc.font('Helvetica').fontSize(itemFontSize);
        cols.forEach((col, idx) => {
          let align = 'left';
          if (idx === 0) align = isQuotation ? 'center' : 'left';
          else if (idx === 1 && !isQuotation) align = 'center';
          else if (isQuotation && (idx === 1 || idx === 3)) align = 'center';
          else align = 'right';

          const paddingX = align === 'right' ? 8 : (align === 'center' ? 0 : 8);
          const textX = align === 'right' ? colX : colX + paddingX;
          const textW = align === 'right' ? col.width - paddingX : (align === 'center' ? col.width : col.width - paddingX * 2);

          doc.text(values[idx], textX, currentRowY + 3, {
            width: textW,
            align,
            ellipsis: true,
          });
          colX += col.width;
        });

        currentRowY += rowHeight;
        if (isQuotation) {
          doc.moveTo(leftX, currentRowY).lineTo(rightX, currentRowY).stroke();
        }
      });

      // Totals Area Coordinates
      const col1RightX = leftX + 255.28; // 295.28
      const col2RightX = col1RightX + 80; // 375.28
      const col3RightX = col2RightX + 80; // 455.28
      const amountColX = isQuotation ? rightX - 100 : col3RightX; // 455.28
      const amountColWidth = rightX - amountColX; // 100

      let tableBottomY = isQuotation ? Math.max(currentRowY, 440) : 380;

      if (isQuotation) {
        // Add 'Total Amount (Rs.)' summary row at the bottom of the Quotation table
        const totalRowHeight = 16;
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('Total Amount (Rs.):', leftX, currentRowY + 4, {
          width: amountColX - leftX - 8,
          align: 'right',
        });
        doc.text(formatINR(totalInvoiceValue), amountColX, currentRowY + 4, {
          width: amountColWidth - 8,
          align: 'right',
        });

        const itemsAreaBottomY = currentRowY;
        currentRowY += totalRowHeight;
        tableBottomY = currentRowY;

        // Line closing bottom of total row
        doc.moveTo(leftX, tableBottomY).lineTo(rightX, tableBottomY).stroke();

        // Draw vertical column separators:
        // First 3 column dividers (UNITS, RATE, DAYS) go from tableHeaderY down to itemsAreaBottomY
        let vX = leftX;
        for (let c = 0; c < cols.length - 2; c++) {
          vX += cols[c].width;
          doc.moveTo(vX, tableHeaderY).lineTo(vX, itemsAreaBottomY).stroke();
        }
        // Final column divider before AMOUNT goes all the way down to tableBottomY
        doc.moveTo(amountColX, tableHeaderY).lineTo(amountColX, tableBottomY).stroke();

        // Quotation Note
        const noteY = tableBottomY + 14;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Note :', 50, noteY);
        doc.font('Helvetica').fontSize(8).text(
          'Chief Guest fees and hospitality charges are payable by the college and are excluded from this quote.',
          50,
          noteY + 12,
          { width: 450 }
        );
      } else {
        // Invoices: Render Totals exactly as shown in the 4 reference images
        const totalsStartY = Math.max(currentRowY + 10, 310);
        const rowH = 17;

        // Line under the initial item amount in the Amount column
        doc.moveTo(amountColX, totalsStartY).lineTo(rightX, totalsStartY).stroke();

        let curY = totalsStartY;

        if (templateType === 'jm_proforma_2') {
          // JM Proforma 2:
          doc.font('Helvetica').fontSize(8);
          doc.text('Total Taxable value', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          curY += rowH;

          // Full horizontal line
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

          // Grand Total: Total Invoice Value in Col 1-3, Amount in Col 4
          doc.font('Helvetica-Bold').fontSize(8);
          doc.text('Total Invoice Value', leftX, curY + 4, { width: amountColX - leftX - 8, align: 'right' });
          doc.text(formatINR(totalInvoiceValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full line closing table
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

        } else if (templateType === 'jm_proforma_1') {
          // JM Proforma 1:
          // Row 1: Discount
          doc.font('Helvetica').fontSize(8);
          doc.text('Discount', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(discount), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 2: Total Taxable Value
          doc.text('Total Taxable Value', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(taxableValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Line under Amount column
          doc.moveTo(amountColX, curY).lineTo(rightX, curY).stroke();

          // Row 3: Paid
          doc.text('Paid', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(paid), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 4: Due
          doc.text('Due', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(due), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full horizontal line
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

          // Grand Total: Total Invoice Value
          doc.font('Helvetica-Bold').fontSize(8);
          doc.text('Total Invoice Value', leftX, curY + 4, { width: amountColX - leftX - 8, align: 'right' });
          doc.text(formatINR(totalInvoiceValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full line closing table
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

        } else if (templateType === 'jina_tax_invoice') {
          // Jina Tax Invoice:
          // Row 1: Less : Discount
          doc.font('Helvetica').fontSize(8);
          doc.text('Less : Discount', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(discount), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 2: Total Taxable value
          doc.text('Total Taxable value', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text(formatINR(taxableValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 3: CGST | 9% | Amount
          doc.text('CGST', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text('9%', col2RightX, curY + 4, { width: col3RightX - col2RightX - 8, align: 'right' });
          doc.text(formatINR(cgst), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 4: SGST | 9% | Amount
          doc.text('SGST', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text('9%', col2RightX, curY + 4, { width: col3RightX - col2RightX - 8, align: 'right' });
          doc.text(formatINR(sgst), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full horizontal line
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

          // Grand Total: Total Invoice Value
          doc.font('Helvetica-Bold').fontSize(8);
          doc.text('Total Invoice Value', leftX, curY + 4, { width: amountColX - leftX - 8, align: 'right' });
          doc.text(formatINR(totalInvoiceValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full line closing table
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

        } else if (templateType === 'jina_proforma') {
          // Jina Proforma:
          // Row 1: Total Taxable value
          doc.font('Helvetica').fontSize(8);
          doc.text('Total Taxable value', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          curY += rowH;

          // Row 2: CGST | 9% | Amount
          doc.text('CGST', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text('9%', col2RightX, curY + 4, { width: col3RightX - col2RightX - 8, align: 'right' });
          doc.text(formatINR(cgst), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Row 3: SGST | 9% | Amount
          doc.text('SGST', leftX, curY + 4, { width: col1RightX - leftX - 8, align: 'right' });
          doc.text('9%', col2RightX, curY + 4, { width: col3RightX - col2RightX - 8, align: 'right' });
          doc.text(formatINR(sgst), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full horizontal line
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();

          // Grand Total: Total Invoice Value
          doc.font('Helvetica-Bold').fontSize(8);
          doc.text('Total Invoice Value', leftX, curY + 4, { width: amountColX - leftX - 8, align: 'right' });
          doc.text(formatINR(totalInvoiceValue), amountColX, curY + 4, { width: amountColWidth - 8, align: 'right' });
          curY += rowH;

          // Full line closing table
          doc.moveTo(leftX, curY).lineTo(rightX, curY).stroke();
        }

        const grandTotalRowTopY = curY - rowH;
        tableBottomY = curY;

        // Draw Vertical Separators for the table
        // Column 1 right boundary: from tableHeaderY down to grandTotalRowTopY
        doc.moveTo(col1RightX, tableHeaderY).lineTo(col1RightX, grandTotalRowTopY).stroke();
        // Column 2 right boundary: from tableHeaderY down to grandTotalRowTopY
        doc.moveTo(col2RightX, tableHeaderY).lineTo(col2RightX, grandTotalRowTopY).stroke();
        // Column 3 right boundary: from tableHeaderY down to tableBottomY
        doc.moveTo(col3RightX, tableHeaderY).lineTo(col3RightX, tableBottomY).stroke();

        // 6. Footer Section (Amount in words & Bank Details)
        const wordsY = tableBottomY + 14;
        const wordsText = convertAmountToWords(totalInvoiceValue);

        doc.font('Helvetica-Bold').fontSize(8.5).text('Amount Chargeable (in words):', 50, wordsY);
        doc.font('Helvetica-Bold').fontSize(8.5).text(wordsText, 50, wordsY + 13);

        // Bank Details (Clean Tabular Layout, NO SIGNATURE)
        const bankBlockY = wordsY + 36;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Payable to:', 50, bankBlockY, { underline: true });

        let bRows = [];
        if (isJM) {
          bRows = [
            ['Beneficiary Name:', data.beneficiaryName || 'M/s. jinavaradoss'],
            ['Bank Name &Full address:', data.bankName || 'HDFC'],
            ['Bank Account No:', data.accountNo || '50100824770808'],
            ['Bank Branch :', data.bankBranch || data.branch || 'nelso manickam road'],
            ['Account type:', data.accountType || 'savings A/c'],
            ['IFSC Code :', data.ifsc || 'HDFC0000441'],
          ];
        } else {
          bRows = [
            ['Beneficiary Name:', data.beneficiaryName || 'M/s. Jina Groups Of Company Private Limited'],
            ['Bank Name &Full address:', data.bankName || 'Indian Overseas Bank'],
            ['Bank Account No:', data.accountNo || '311402000000541'],
          ];
          if (templateType === 'jina_proforma') {
            bRows.push(['Bank Branch :', data.bankBranch || data.branch || 'Zamin Pallavaram']);
          }
          bRows.push(['Account type:', data.accountType || 'Current A/c']);
          bRows.push(['IFSC Code :', data.ifsc || 'IOBA0003114']);
        }

        // Clean Two-Column Bank Table Alignment to avoid ANY text overlap
        const bLabelLeft = 50;
        const bValueLeft = 190;
        let bCurrentY = bankBlockY + 14;

        bRows.forEach(([lbl, val]) => {
          doc.font('Helvetica').fontSize(8).text(lbl, bLabelLeft, bCurrentY, { width: 135 });
          doc.font('Helvetica').fontSize(8).text(val, bValueLeft, bCurrentY, { width: 310 });
          bCurrentY += 13;
        });

        // Please quote PAN: positioned DIRECTLY below the bank details
        if (!isJM) {
          bCurrentY += 10;
          doc.font('Helvetica-Bold').fontSize(8).text('Please quote PAN: AAHCJ5418R in Your TDS Return', 50, bCurrentY);
        }
      }

      // End Document Stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};
