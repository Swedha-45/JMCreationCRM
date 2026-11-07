const fs = require('fs');
const path = require('path');

/**
 * Helper to encode local image files to base64 Data URLs so Puppeteer embeds them reliably.
 */
const getLogoDataUrl = (filename) => {
  const possiblePaths = [
    path.join(__dirname, '../assets', filename),
    path.join(__dirname, '../../assets', filename),
    path.join(process.cwd(), 'backend/assets', filename),
    path.join(process.cwd(), 'assets', filename),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        return `data:image/png;base64,${fileBuffer.toString('base64')}`;
      } catch (err) {
        console.error(`Error reading logo ${filename}:`, err);
      }
    }
  }
  return `/assets/${filename}`;
};

// Global Company Data
const JINA_DATA = {
  name: 'JINA GROUPS OF COMPANY PRIVATE LIMITED',
  subName: '(Trading as JM Creations)',
  address: 'NO.3/6 NEW STREET, PERIYAGARAM, GINGEE, VILLUPURAM, TAMILNADU-604202',
  gstin: '33AAHCJ5418R1ZZ',
  mobile: '9876543210',
  email: 'contact@jmcreation.in',
  bankName: 'Indian Overseas Bank',
  accountNo: '311402000000541',
  branch: 'Zamin Pallavaram',
  accountType: 'Current A/c',
  ifsc: 'IOBA0003114',
  logoFile: 'jina-logo.png',
};

const JM_DATA = {
  name: 'JM CREATIONS',
  subName: 'A Unit of Jina Groups',
  address: 'NO.3/6 NEW STREET, PERIYAGARAM, GINGEE, VILLUPURAM, TAMILNADU-604202',
  mobile: '9876543210',
  email: 'contact@jmcreation.in',
  bankName: 'HDFC',
  accountNo: '5010024770808',
  branch: 'neiko manickam road',
  accountType: 'savings A/c',
  ifsc: 'HDFC0000441',
  logoFile: 'jm-logo.png',
};

/**
 * Shared HTML Header
 */
const renderHeader = (company) => {
  const logoSrc = getLogoDataUrl(company.logoFile);
  const isJM = company.name.includes('JM');
  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
      <tr>
        <td style="width: 100px; vertical-align: middle; padding: 4px; text-align: center; border-right: 1.5px solid #000;">
          <div style="${isJM ? 'background-color: #ffd255; padding: 6px; display: inline-block;' : ''}">
            <img src="${logoSrc}" alt="Logo" style="max-width: 85px; max-height: 65px; object-fit: contain; display: block;" />
          </div>
        </td>
        <td style="vertical-align: middle; text-align: center; padding: 4px 10px;">
          <div style="font-size: 13px; font-weight: bold; color: #000;">${company.name}</div>
          ${company.subName ? `<div style="font-size: 10.5px; font-weight: bold; color: #000; margin-top: 1px;">${company.subName}</div>` : ''}
          <div style="font-size: 10px; font-weight: bold; color: #000; margin-top: 2px;">
            ${company.address}
          </div>
          ${company.gstin ? `<div style="font-size: 10px; font-weight: bold; color: #000; margin-top: 2px;">GSTIN: ${company.gstin}</div>` : ''}
          <div style="font-size: 10px; font-weight: bold; color: #000; margin-top: 2px;">
            Mobile No :${company.mobile} | Mail ID:${company.email}
          </div>
        </td>
      </tr>
    </table>
    <div style="border-top: 1.5px solid #000; margin-bottom: 8px;"></div>
  `;
};

/**
 * Shared Client & Meta Section
 */
const renderClientInfo = (data, isQuotation = false) => {
  const clientName = data.clientName || 'Valued Client';
  const clientAddress = data.clientAddress || 'Client Office Address';
  const clientGstin = data.clientGstin || 'N/A';
  const clientMobile = data.clientMobile || 'N/A';
  const docNumber = data.docNumber || data.invoiceNumber || 'INV-001';
  const date = data.date || new Date().toLocaleDateString('en-GB');

  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
      <tr>
        <td style="width: 60%; vertical-align: top; padding: 4px;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #222;">
            ${isQuotation ? 'To:' : 'Billed To:'}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #000; margin-top: 2px;">
            ${clientName}
          </div>
          <div style="font-size: 10.5px; color: #333; margin-top: 2px; line-height: 1.3;">
            ${clientAddress}
          </div>
          <div style="font-size: 10.5px; color: #333; margin-top: 3px;">
            ${clientGstin && clientGstin !== 'N/A' ? `<b>GSTIN:</b> ${clientGstin} &nbsp;|&nbsp; ` : ''}<b>Mobile:</b> ${clientMobile}
          </div>
        </td>
        <td style="width: 40%; vertical-align: top; text-align: right; padding: 4px;">
          <div style="font-size: 11px; font-weight: bold;">
            ${isQuotation ? 'Quotation No:' : 'Invoice No:'} <span style="color: #000;">${docNumber}</span>
          </div>
          <div style="font-size: 11px; margin-top: 4px;">
            <b>Date:</b> ${date}
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Shared Document Title
 */
const renderDocTitle = (title) => `
  <div style="text-align: center; font-size: 14px; font-weight: bold; letter-spacing: 0.5px; padding: 6px 0; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; margin-bottom: 10px; background-color: #fafafa;">
    ${title}
  </div>
`;

/**
 * Shared Bank & Footer Section (NO Signatures)
 */
const renderFooter = (company, amountInWords, extraNote = null) => {
  const isJM = company.name.includes('JM');
  return `
    <div style="margin-top: 15px; font-size: 11px; margin-bottom: 15px;">
      <b>Amount Chargeable (in words):</b> <span style="font-weight: bold;">${amountInWords || 'Zero Rupees Only'}</span>
    </div>

    <!-- Bank Details (Clean Tabular Layout, NO Signatures) -->
    <div style="margin-top: 15px; font-size: 11px;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">Payable to:</div>
      <table style="width: 100%; border-collapse: collapse; line-height: 1.6;">
        <tr>
          <td style="width: 170px; padding: 2px 0;">Beneficiary Name:</td>
          <td style="padding: 2px 0;">${isJM ? 'M/s. jinavaradoss' : 'M/s. Jina Groups Of Company Private Limited'}</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">Bank Name &amp;Full address:</td>
          <td style="padding: 2px 0;">${company.bankName}</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">Bank Account No:</td>
          <td style="padding: 2px 0;">${company.accountNo}</td>
        </tr>
        ${company.branch ? `
        <tr>
          <td style="padding: 2px 0;">Bank Branch :</td>
          <td style="padding: 2px 0;">${company.branch}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 2px 0;">Account type:</td>
          <td style="padding: 2px 0;">${company.accountType}</td>
        </tr>
        <tr>
          <td style="padding: 2px 0;">IFSC Code :</td>
          <td style="padding: 2px 0;">${company.ifsc}</td>
        </tr>
      </table>

      ${!isJM ? `
      <div style="font-weight: bold; margin-top: 10px;">
        Please quote PAN: AAHCJ5418R in Your TDS Return
      </div>
      ` : ''}
    </div>

    ${extraNote ? `
      <div style="margin-top: 15px; padding: 6px 8px; border-top: 1px dashed #666; font-size: 10.5px; font-weight: bold; color: #000;">
        ${extraNote}
      </div>
    ` : ''}
  `;
};

/**
 * Base Page Wrapper enforcing A4 width (approx 750px) & border: 2px solid black
 */
const wrapPage = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #000;
    }
    .invoice-box {
      width: 750px;
      margin: 0 auto;
      border: 2px solid black;
      padding: 12px 14px;
      min-height: 1020px;
      position: relative;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 11px;
    }
    table.data-table th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="invoice-box">
    ${content}
  </div>
</body>
</html>
`;

// =========================================================================
// FUNCTION 1: getJinaQuotationHTML(data)
// Title: PRICE QUOTATION.
// Columns: DESCRIPTION | UNITS | RATE (P.U) | DAYS | AMOUNT(Rs.).
// Footer: "Note: Chief Guest fees and hospitality charges are payable by the college and are excluded from this quote."
// =========================================================================
const getJinaQuotationHTML = (data = {}) => {
  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : [
    { description: data.description || 'Professional Consulting & Technical Services', units: data.units || 1, rate: data.rate || 10000, days: data.days || 1, amount: data.amount || 10000 }
  ];

  let calculatedTotal = 0;
  const rowsHTML = items.map((item, idx) => {
    const units = (item.units !== undefined && item.units !== null && item.units !== '') ? item.units : '';
    const rate = (item.rate !== undefined && item.rate !== null && item.rate !== '') ? Number(item.rate) : '';
    const days = (item.days !== undefined && item.days !== null && item.days !== '') ? item.days : '';
    const amount = item.amount !== undefined && item.amount !== null && item.amount !== ''
      ? Number(item.amount)
      : (typeof rate === 'number' ? rate * (Number(units) || 1) * (Number(days) || 1) : 0);
    calculatedTotal += (Number(amount) || 0);

    return `
      <tr>
        <td class="text-center" style="width: 35px;">${idx + 1}</td>
        <td class="text-left">${item.description || ''}</td>
        <td class="text-center" style="width: 65px;">${units}</td>
        <td class="text-right" style="width: 90px;">${typeof rate === 'number' ? rate.toLocaleString('en-IN') : ''}</td>
        <td class="text-center" style="width: 65px;">${days}</td>
        <td class="text-right" style="width: 110px;">${amount ? amount.toLocaleString('en-IN') : ''}</td>
      </tr>
    `;
  }).join('');

  const total = data.totalInvoiceValue !== undefined ? Number(data.totalInvoiceValue) : calculatedTotal;

  const content = `
    ${renderHeader(JINA_DATA)}
    ${renderClientInfo(data, true)}
    ${renderDocTitle('PRICE QUOTATION')}

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">S.No</th>
          <th>DESCRIPTION</th>
          <th style="width: 65px;">UNITS</th>
          <th style="width: 90px;">RATE (P.U)</th>
          <th style="width: 65px;">DAYS</th>
          <th style="width: 110px;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
        <tr>
          <td colspan="5" class="text-right" style="font-weight: bold; padding: 6px 8px;">Total Quotation Value:</td>
          <td class="text-right" style="font-weight: bold; padding: 6px 8px;">${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

  `;

  return wrapPage(content);
};

// =========================================================================
// FUNCTION 2: getJinaProformaHTML(data)
// Title: PROFORMA INVOICE.
// Columns: DESCRIPTION | SAC/HSIN | RATE | AMOUNT(Rs.).
// Math Rows: Total Taxable Value, CGST (9%), SGST (9%), Total Invoice Value.
// =========================================================================
const getJinaProformaHTML = (data = {}) => {
  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : [
    { description: data.description || 'CRM Tool Development & Implementation', sacHsn: data.sacHsn || '998314', rate: data.rate || 10000, amount: data.amount || 10000 }
  ];

  let totalTaxable = 0;
  const rowsHTML = items.map((item, idx) => {
    const rate = Number(item.rate) || 0;
    const amount = item.amount !== undefined ? Number(item.amount) : rate;
    totalTaxable += amount;

    return `
      <tr>
        <td class="text-center" style="width: 35px;">${idx + 1}</td>
        <td class="text-left">${item.description}</td>
        <td class="text-center" style="width: 90px;">${item.sacHsn || '998314'}</td>
        <td class="text-right" style="width: 100px;">${rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="text-right" style="width: 120px;">${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  const taxableVal = data.taxableValue !== undefined ? Number(data.taxableValue) : totalTaxable;
  const cgst = data.cgst !== undefined ? Number(data.cgst) : taxableVal * 0.09;
  const sgst = data.sgst !== undefined ? Number(data.sgst) : taxableVal * 0.09;
  const total = data.totalInvoiceValue !== undefined ? Number(data.totalInvoiceValue) : Math.round(taxableVal + cgst + sgst);

  const content = `
    ${renderHeader(JINA_DATA)}
    ${renderClientInfo(data, false)}
    ${renderDocTitle('PROFORMA INVOICE')}

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">S.No</th>
          <th>DESCRIPTION</th>
          <th style="width: 90px;">SAC/HSIN</th>
          <th style="width: 100px;">RATE</th>
          <th style="width: 120px;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
        <tr>
          <td colspan="4" class="text-right" style="font-weight: bold;">Total Taxable Value:</td>
          <td class="text-right" style="font-weight: bold;">${taxableVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right">CGST (9%):</td>
          <td class="text-right">${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right">SGST (9%):</td>
          <td class="text-right">${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td colspan="4" class="text-right" style="font-weight: bold; font-size: 12px;">Total Invoice Value:</td>
          <td class="text-right" style="font-weight: bold; font-size: 12px;">${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    ${renderFooter(JINA_DATA, data.amountInWords)}
  `;

  return wrapPage(content);
};

// =========================================================================
// FUNCTION 3: getJinaTaxInvoiceHTML(data)
// Title: TAX INVOICE.
// Columns: DESCRIPTION | SAC/HSIN | RATE | AMOUNT(Rs.).
// Math Rows: Less: Discount, Total Taxable Value, CGST (9%), SGST (9%), Total Invoice Value.
// =========================================================================
const getJinaTaxInvoiceHTML = (data = {}) => {
  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : [
    { description: data.description || 'Enterprise Software Licensing & Integration', sacHsn: data.sacHsn || '998314', rate: data.rate || 10000, amount: data.amount || 10000 }
  ];

  let rawSubtotal = 0;
  const rowsHTML = items.map((item, idx) => {
    const rate = Number(item.rate) || 0;
    const amount = item.amount !== undefined ? Number(item.amount) : rate;
    rawSubtotal += amount;

    return `
      <tr>
        <td class="text-center" style="width: 35px;">${idx + 1}</td>
        <td class="text-left">${item.description}</td>
        <td class="text-center" style="width: 90px;">${item.sacHsn || '998314'}</td>
        <td class="text-right" style="width: 100px;">${rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="text-right" style="width: 120px;">${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  const discount = Number(data.discount) || 0;
  const taxableVal = data.taxableValue !== undefined ? Number(data.taxableValue) : Math.max(0, rawSubtotal - discount);
  const cgst = data.cgst !== undefined ? Number(data.cgst) : taxableVal * 0.09;
  const sgst = data.sgst !== undefined ? Number(data.sgst) : taxableVal * 0.09;
  const total = data.totalInvoiceValue !== undefined ? Number(data.totalInvoiceValue) : Math.round(taxableVal + cgst + sgst);

  const content = `
    ${renderHeader(JINA_DATA)}
    ${renderClientInfo(data, false)}
    ${renderDocTitle('TAX INVOICE')}

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">S.No</th>
          <th>DESCRIPTION</th>
          <th style="width: 90px;">SAC/HSIN</th>
          <th style="width: 100px;">RATE</th>
          <th style="width: 120px;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
        <tr>
          <td colspan="4" class="text-right">Subtotal:</td>
          <td class="text-right">${rawSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right" style="color: #b91c1c;">Less: Discount:</td>
          <td class="text-right" style="color: #b91c1c;">-${discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right" style="font-weight: bold;">Total Taxable Value:</td>
          <td class="text-right" style="font-weight: bold;">${taxableVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right">CGST (9%):</td>
          <td class="text-right">${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right">SGST (9%):</td>
          <td class="text-right">${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td colspan="4" class="text-right" style="font-weight: bold; font-size: 12px;">Total Invoice Value:</td>
          <td class="text-right" style="font-weight: bold; font-size: 12px;">${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    ${renderFooter(JINA_DATA, data.amountInWords)}
  `;

  return wrapPage(content);
};

// =========================================================================
// FUNCTION 4: getJMProforma1HTML(data)
// Title: PRO FORMA INVOICE.
// Columns: DESCRIPTION | SAC/HSIN | RATE | AMOUNT(Rs.).
// Math Rows: Discount, Total Taxable Value, Paid, Due, Total Invoice Value. (No CGST/SGST).
// =========================================================================
const getJMProforma1HTML = (data = {}) => {
  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : [
    { description: data.description || 'Website Design & Implementation', sacHsn: data.sacHsn || '998314', rate: data.rate || 10000, amount: data.amount || 10000 }
  ];

  let rawSubtotal = 0;
  const rowsHTML = items.map((item, idx) => {
    const rate = Number(item.rate) || 0;
    const amount = item.amount !== undefined ? Number(item.amount) : rate;
    rawSubtotal += amount;

    return `
      <tr>
        <td class="text-center" style="width: 35px;">${idx + 1}</td>
        <td class="text-left">${item.description}</td>
        <td class="text-center" style="width: 90px;">${item.sacHsn || '998314'}</td>
        <td class="text-right" style="width: 100px;">${rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="text-right" style="width: 120px;">${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  const discount = Number(data.discount) || 0;
  const taxableVal = data.taxableValue !== undefined ? Number(data.taxableValue) : Math.max(0, rawSubtotal - discount);
  const total = data.totalInvoiceValue !== undefined ? Number(data.totalInvoiceValue) : taxableVal;
  const paid = Number(data.paid) || 0;
  const due = data.due !== undefined ? Number(data.due) : Math.max(0, total - paid);

  const content = `
    ${renderHeader(JM_DATA)}
    ${renderClientInfo(data, false)}
    ${renderDocTitle('PRO FORMA INVOICE')}

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">S.No</th>
          <th>DESCRIPTION</th>
          <th style="width: 90px;">SAC/HSIN</th>
          <th style="width: 100px;">RATE</th>
          <th style="width: 120px;">AMOUNT(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
        <tr>
          <td colspan="4" class="text-right">Discount:</td>
          <td class="text-right">-${discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right" style="font-weight: bold;">Total Taxable Value:</td>
          <td class="text-right" style="font-weight: bold;">${taxableVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right" style="color: #047857;">Paid:</td>
          <td class="text-right" style="color: #047857;">${paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td colspan="4" class="text-right" style="color: #b45309; font-weight: bold;">Due:</td>
          <td class="text-right" style="color: #b45309; font-weight: bold;">${due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td colspan="4" class="text-right" style="font-weight: bold; font-size: 12px;">Total Invoice Value:</td>
          <td class="text-right" style="font-weight: bold; font-size: 12px;">${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    ${renderFooter(JM_DATA, data.amountInWords)}
  `;

  return wrapPage(content);
};

const { getJMProforma2HTML } = require('./jmTemplates');

module.exports = {
  getJinaQuotationHTML,
  getJinaProformaHTML,
  getJinaTaxInvoiceHTML,
  getJMProforma1HTML,
  getJMProforma2HTML,
  getJMProformaInvoiceHTML: getJMProforma2HTML,
};

