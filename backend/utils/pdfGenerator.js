const puppeteer = require('puppeteer');

/**
 * Generates an A4 PDF from an HTML string using Puppeteer and streams it to the Express response.
 *
 * @param {string} html - Valid HTML string with inline CSS
 * @param {Object} res - Express HTTP response object
 */
const generatePdfFromHtml = async (html, res) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      pipe: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    const page = await browser.newPage();

    // Set HTML content and wait for images/resources to finish loading
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000,
    });

    // Generate pixel-perfect A4 PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '8mm',
        bottom: '8mm',
        left: '8mm',
        right: '8mm',
      },
    });

    if (res && !res.headersSent) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
      }
      if (typeof res.end === 'function') {
        res.end(pdfBuffer);
      }
    }

    return pdfBuffer;
  } catch (error) {
    console.error('Puppeteer PDF generation failed:', error);
    if (res && !res.headersSent && typeof res.status === 'function') {
      res.status(500).json({
        success: false,
        message: `PDF generation error: ${error.message}`,
      });
    }
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Error closing Puppeteer browser:', closeErr);
      }
    }
  }
};

module.exports = {
  generatePdfFromHtml,
};
