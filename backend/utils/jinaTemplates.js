const numberToWords = require('number-to-words');

/**
 * Generates a complete, pixel-perfect HTML string for Jina Tax Invoice using <table> layouts.
 * Strictly avoids flexbox and applies solid black borders and cell padding for clean PDF rendering.
 *
 * @param {Object} data Invoice metadata, line items, and financial calculations
 * @returns {string} Complete HTML document string with inline CSS
 */
const getJinaTaxInvoiceHTML = (data = {}) => {
  // 1. Client & Document Metadata
  const clientName = data.clientName || '';
  const clientAddress = data.clientAddress || '';
  const clientGstin = data.clientGstin || '';
  const clientMobile = data.clientMobile || '';
  const invoiceNo = data.invoiceNo || data.docNumber || data.invoiceNumber || '';
  const date = data.date || '';

  // 2. Line Items & Subtotal Calculation
  const items = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : (data.description ? [
        {
          description: data.description,
          sacHsn: data.sacHsn || '998314',
          rate: Number(data.rate) || 0,
          amount: data.amount !== undefined ? Number(data.amount) : Number(data.rate) || 0,
        }
      ] : []);

  let subtotal = 0;
  const itemsRowsHTML = items.map((item) => {
    const desc = item.description || item.name || item.serviceName || '';
    const sac = item.sacHsn || item.sac || item.hsn || item.hsnCode || '998314';
    const rate = Number(item.rate || item.price || 0);
    const units = Number(item.units || item.quantity || item.qty || 1);
    const days = Number(item.days || 1);
    const amount = (item.amount !== undefined && item.amount !== null && !isNaN(item.amount))
      ? Number(item.amount)
      : rate * units * (item.days ? days : 1);

    subtotal += amount;

    return `
      <tr>
        <td style="border: 1px solid black; padding: 5px; text-align: left;">${desc}</td>
        <td style="border: 1px solid black; padding: 5px; text-align: center;">${sac}</td>
        <td style="border: 1px solid black; padding: 5px; text-align: right;">${rate.toFixed(2)}</td>
        <td style="border: 1px solid black; padding: 5px; text-align: right;">${amount.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // 3. Financial Calculations
  const discount = Number(data.discount || 0);
  const taxableValue = Math.max(0, subtotal - discount);
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const totalInvoiceValue = taxableValue + cgst + sgst;

  // 4. Amount Chargeable in Words
  let amountInWords = data.amountInWords;
  if (!amountInWords && totalInvoiceValue >= 0) {
    try {
      const integerPart = Math.floor(totalInvoiceValue);
      const decimalPart = Math.round((totalInvoiceValue - integerPart) * 100);
      let words = numberToWords.toWords(integerPart);
      words = words.charAt(0).toUpperCase() + words.slice(1);
      if (decimalPart > 0) {
        words += ` and ${numberToWords.toWords(decimalPart)} paise`;
      }
      amountInWords = `${words} only`;
    } catch {
      amountInWords = '';
    }
  }

  // 5. Complete HTML Construction with <table> Layouts and Inline Styles
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNo || 'Jina'}</title>
  <style>
    @page {
      size: A4;
      margin: 20px;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      margin: 0;
      padding: 0;
      color: #000;
      background-color: #fff;
    }
    .invoice-container {
      border: 2px solid black;
      padding: 10px;
      box-sizing: border-box;
      width: 100%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 5px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="invoice-container" style="border: 2px solid black; padding: 10px; font-family: Arial, sans-serif; font-size: 11px; box-sizing: border-box; width: 100%;">
    
    <!-- Header -->
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 120px; vertical-align: top; padding: 5px;">
          <img src="http://localhost:5000/assets/jina-logo.png" alt="Logo" style="max-width: 110px; max-height: 80px; object-fit: contain;" />
        </td>
        <td style="vertical-align: top; text-align: center; padding: 5px; line-height: 1.4;">
          <div style="font-weight: bold; font-size: 13px; color: #000;">JINA GROUPS OF COMPANY PRIVATE LIMITED (Trading as JM Creations)</div>
          <div style="font-weight: bold; font-size: 11px; color: #000; margin-top: 2px;">NO.3/6 NEW STREET, PERIYAGARAM, GINGEE, VILLUPURAM, TAMILNADU-604202</div>
          <div style="font-weight: bold; font-size: 11px; color: #000; margin-top: 2px;">GSTIN: 33AAHCJ5418R1Z2</div>
          <div style="font-weight: bold; font-size: 11px; color: #000; margin-top: 2px;">Mobile No: 9042986355 | Mail ID: jinagroupsofcompay.info@gmail.com</div>
        </td>
      </tr>
    </table>

    <!-- Horizontal line under header -->
    <div style="border-top: 1px solid black; margin: 8px 0;"></div>

    <!-- Client Info -->
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 60%; vertical-align: top; padding: 5px; line-height: 1.4;">
          <div style="font-weight: bold;">Billed To :</div>
          <div style="font-weight: bold; margin-top: 2px;">${clientName}</div>
          <div>${clientAddress}</div>
          ${clientGstin ? `<div>GSTIN: ${clientGstin}</div>` : ''}
          ${clientMobile ? `<div>Mobile: ${clientMobile}</div>` : ''}
        </td>
        <td style="width: 40%; vertical-align: top; text-align: right; padding: 5px; line-height: 1.5;">
          <div><b>Invoice No:</b> ${invoiceNo}</div>
          <div><b>Date:</b> ${date}</div>
        </td>
      </tr>
    </table>

    <!-- Horizontal line under client info -->
    <div style="border-top: 1px solid black; margin: 8px 0;"></div>

    <!-- Title -->
    <div style="text-align: center; font-weight: bold; text-decoration: underline; font-size: 13px; margin: 10px 0;">
      TAX INVOICE
    </div>

    <!-- Table of Items & Totals -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 5px; text-align: left; width: 50%;">DESCRIPTION</th>
          <th style="border: 1px solid black; padding: 5px; text-align: center; width: 15%;">SAC/HSIN</th>
          <th style="border: 1px solid black; padding: 5px; text-align: right; width: 15%;">RATE</th>
          <th style="border: 1px solid black; padding: 5px; text-align: right; width: 20%;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHTML}
        ${discount > 0 ? `
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: right;">Less: Discount</td>
          <td style="border: 1px solid black; padding: 5px; text-align: right;">${discount.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: right;">Total Taxable value</td>
          <td style="border: 1px solid black; padding: 5px; text-align: right;">${taxableValue.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: right;">CGST (9%)</td>
          <td style="border: 1px solid black; padding: 5px; text-align: right;">${cgst.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: right;">SGST (9%)</td>
          <td style="border: 1px solid black; padding: 5px; text-align: right;">${sgst.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: right; font-weight: bold;">Total Invoice Value</td>
          <td style="border: 1px solid black; padding: 5px; text-align: right; font-weight: bold;">${totalInvoiceValue.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Amount Chargeable (in words) -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-top: 10px;">
      <tr>
        <td style="border: 1px solid black; padding: 5px; font-weight: bold;">
          Amount Chargeable (in words): <span style="font-weight: normal; text-transform: capitalize;">${amountInWords}</span>
        </td>
      </tr>
    </table>

    <!-- Bank Details & TDS PAN (No Signatures) -->
    <div style="margin-top: 15px;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">Payable to:</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.5;">
        <tr>
          <td style="width: 160px; padding: 2px 0;">Beneficiary Name:</td>
          <td style="padding: 2px 0;">M/s. Jina Groups Of Company Private Limited</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">Bank Name &amp; Full address:</td>
          <td style="padding: 2px 0;">Indian Overseas Bank</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">Bank Account No:</td>
          <td style="padding: 2px 0;">311402000000541</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">Account type:</td>
          <td style="padding: 2px 0;">Current A/c</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">IFSC Code :</td>
          <td style="padding: 2px 0;">IOBA0003114</td>
        </tr>
      </table>
      <div style="font-weight: bold; margin-top: 10px;">
        Please quote PAN: AAHCJ5418R in Your TDS Return
      </div>
    </div>

  </div>
</body>
</html>`;
};

module.exports = {
  getJinaTaxInvoiceHTML,
};

