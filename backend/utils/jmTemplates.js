const numberToWords = require('number-to-words');

/**
 * Generates a pixel-perfect HTML string for JM Creations Proforma 2 invoice.
 * Strictly adheres to standard HTML/CSS, Flexbox structure, and exact styling requirements.
 *
 * @param {Object} data Invoice data payload containing client details, items, and totals
 * @returns {string} Complete HTML document string
 */
const getJMProforma2HTML = (data = {}) => {
  // 1. Client & Document Details
  const clientName = data.clientName || 'M/s waymax global';
  const clientAddress = data.clientAddress ||
    '4th Floor Building No./Flat.: No.129, Road/Street. Plaza Centre, Gopathy Narayana Rd, Gangai Karai Puram, T. Nagar, Chennai, Tamil Nadu 600006, India';
  const formattedAddress = String(clientAddress).replace(/\n/g, '<br>');
  const clientGstin = data.clientGstin ? (String(data.clientGstin).startsWith('GSTIN') ? data.clientGstin : `GSTIN: ${data.clientGstin}`) : 'GSTIN:';
  const clientMobile = data.clientMobile ? (String(data.clientMobile).startsWith('Mobile') ? data.clientMobile : `Mobile No: ${data.clientMobile}`) : 'Mobile No: 9884887556';

  const invoiceNo = data.invoiceNo || data.docNumber || data.invoiceNumber || '01/2025-26';
  const date = data.date || new Date().toLocaleDateString('en-GB');

  // 2. Items & Math Calculations
  const items = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : (data.description ? [
        {
          description: data.description,
          sacHsn: data.sacHsn || '',
          rate: data.rate || '',
          amount: data.amount !== undefined ? data.amount : (data.totalAmount || 3000),
        }
      ] : [
        {
          description: 'Poster ( 30 nos )',
          sacHsn: '',
          rate: '',
          amount: 3000,
        }
      ]);

  let calculatedSubtotal = 0;
  items.forEach((item) => {
    const amt = item.amount !== undefined && item.amount !== null && !isNaN(item.amount)
      ? Number(item.amount)
      : (Number(item.rate || 0) * (Number(item.units || item.quantity || 1)));
    calculatedSubtotal += amt;
  });

  // Ensure exact match for data.subTotal and data.totalAmount passed from controller
  const subTotal = data.subTotal !== undefined && data.subTotal !== null
    ? data.subTotal
    : (data.subtotal !== undefined && data.subtotal !== null
      ? data.subtotal
      : (data.taxableValue !== undefined && data.taxableValue !== null
        ? data.taxableValue
        : calculatedSubtotal));

  const totalAmount = data.totalAmount !== undefined && data.totalAmount !== null
    ? data.totalAmount
    : (data.totalInvoiceValue !== undefined && data.totalInvoiceValue !== null
      ? data.totalInvoiceValue
      : subTotal);

  // 3. Amount Chargeable in Words
  let amountInWords = data.amountInWords;
  if (!amountInWords && totalAmount !== undefined && totalAmount !== null) {
    try {
      const num = Number(totalAmount) || 0;
      const words = numberToWords.toWords(Math.round(num));
      const capitalized = words
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      amountInWords = `${capitalized} Rupees Only`;
    } catch {
      amountInWords = 'Three Thousand Rupees Only';
    }
  }

  // 4. Logo URL
  const logoUrl = data.logoUrl || 'http://localhost:5000/assets/jm-logo.png';

  // 5. Build HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PROFORMA INVOICE</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      margin: 0;
      padding: 0;
      color: #000;
      background-color: #fff;
    }
    .main-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid black;
      padding: 10px;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0;
    }
    th, td {
      border: 1px solid black;
      padding: 8px 10px;
      vertical-align: top;
      font-family: Arial, sans-serif;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="main-container" style="width: 100%; max-width: 800px; margin: 0 auto; border: 2px solid black; padding: 10px; box-sizing: border-box; font-family: Arial, sans-serif; font-size: 12px;">
    
    <!-- 2. Header Layout: Flexbox Row -->
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="flex: 0 0 75px; width: 75px; height: 60px; background-color: #ffd255; border: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
        <img src="${logoUrl}" alt="JM Creations" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" />
      </div>
      <div style="flex: 1; text-align: center; padding-left: 10px;">
        <div style="font-weight: bold; font-size: 14px;">JM Creations</div>
        <div style="margin-top: 2px;">NO 3/6 NEW STREET, PERIYAGARAM, GINGEE, VILLUPURAM, TAMILNADU-604202</div>
        <div style="margin-top: 2px;">Mobile No: 9042986355 | Mail ID: contact@jmcreation.in</div>
      </div>
    </div>
    <hr style="border: 1px solid black; margin: 10px 0;">

    <!-- 3. Client Info Layout: Flexbox Row with space-between -->
    <div style="display: flex; justify-content: space-between;">
      <div style="line-height: 1.5;">
        <div>Billed To :</div>
        <div>${clientName}</div>
        <div>${formattedAddress}</div>
        <div>${clientGstin}</div>
        <div>${clientMobile}</div>
      </div>
      <div style="text-align: right; line-height: 1.5;">
        <div>Invoice No: ${invoiceNo}</div>
        <div>Date: ${date}</div>
      </div>
    </div>
    <hr style="border: 1px solid black; margin: 10px 0;">

    <!-- 4. Document Title -->
    <div style="text-align: center; font-weight: bold; text-decoration: underline; margin: 15px 0;">
      PROFORMA INVOICE
    </div>

    <!-- 5. Main Table -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 0;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: left; width: 45%;">DESCRIPTION</th>
          <th style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: center; width: 18%;">SAC/HSIN</th>
          <th style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right; width: 18%;">RATE</th>
          <th style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right; width: 19%;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => `
        <tr>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; width: 45%;">${item.description || item.name || ''}</td>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: center;">${item.sacHsn || item.sac || item.hsn || ''}</td>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right;">${item.rate !== undefined && item.rate !== null && item.rate !== '' ? item.rate : ''}</td>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right;">${item.amount !== undefined && item.amount !== null && item.amount !== '' ? item.amount : (item.rate || '')}</td>
        </tr>
        `).join('')}
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right;">Total Taxable value</td>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right;">${subTotal}</td>
        </tr>
        <tr>
          <td colspan="3" style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right; font-weight: bold;">Total Invoice Value</td>
          <td style="border: 1px solid black; padding: 8px 10px; vertical-align: top; text-align: right; font-weight: bold;">${totalAmount}</td>
        </tr>
      </tbody>
    </table>

    <!-- 6. Footer Layout -->
    <div style="font-weight: bold; margin-top: 15px; margin-bottom: 20px;">
      Amount Chargeable (in words): ${amountInWords}
    </div>

    <!-- Bank Details (No Signature) -->
    <div style="margin-top: 20px;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">Payable to:</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
        <tr>
          <td style="border: none; padding: 2px 0; width: 170px;">Beneficiary Name:</td>
          <td style="border: none; padding: 2px 0;">${data.beneficiaryName || 'M/s. jinavaradoss'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0;">Bank Name &amp;Full address:</td>
          <td style="border: none; padding: 2px 0;">${data.bankName || 'HDFC'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0;">Bank Account No:</td>
          <td style="border: none; padding: 2px 0;">${data.accountNo || '50100824770808'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0;">Bank Branch :</td>
          <td style="border: none; padding: 2px 0;">${data.branch || data.bankBranch || 'nelso manickam road'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0;">Account type:</td>
          <td style="border: none; padding: 2px 0;">${data.accountType || 'savings A/c'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0;">IFSC Code :</td>
          <td style="border: none; padding: 2px 0;">${data.ifsc || 'HDFC0000441'}</td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html>`;
};

module.exports = {
  getJMProforma2HTML,
  getJMProformaInvoiceHTML: getJMProforma2HTML,
};
