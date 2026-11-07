const nodemailer = require('nodemailer');

/**
 * Generates modern SaaS responsive HTML email template for workspace invitation.
 *
 * @param {string} name - Recipient's full name
 * @param {string} email - Recipient's email (username)
 * @param {string} tempPassword - Generated temporary password
 * @param {string} loginUrl - URL to the login page
 * @returns {string} - HTML email string
 */
const getWelcomeEmailTemplate = (name, email, tempPassword, loginUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JM Creations CRM</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
          
          <!-- Header (#1e3a8a Dark Blue) -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 36px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">
                Welcome to JM Creations CRM
              </h1>
              <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px; font-weight: 400; line-height: 1.4;">
                Your workspace access is successfully configured
              </p>
            </td>
          </tr>

          <!-- Body Content (White Background) -->
          <tr>
            <td style="background-color: #ffffff; padding: 36px 32px 28px 32px; text-align: left;">
              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600; line-height: 1.4;">
                Hello ${name || 'Team Member'},
              </p>

              <!-- Main message -->
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                You have been granted access to the CRM platform. Below are your account access credentials.
              </p>

              <!-- Credentials Box (#f3f4f6 Light Gray) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="margin-bottom: 12px; font-size: 13px; color: #374151; font-family: 'Courier New', Courier, monospace;">
                      <span style="color: #6b7280; font-weight: 600; letter-spacing: 0.5px;">USERNAME:</span> 
                      <span style="color: #111827; font-weight: 500;">${email}</span>
                    </div>
                    <div style="font-size: 13px; color: #374151; font-family: 'Courier New', Courier, monospace;">
                      <span style="color: #6b7280; font-weight: 600; letter-spacing: 0.5px;">PASSWORD:</span> 
                      <strong style="color: #111827; font-weight: 700;">${tempPassword}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button (#2563eb Blue) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); letter-spacing: 0.3px;">
                      Access Workspace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer (Light Background & Small Text) -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                If you did not request this, please ignore this email.
              </p>
              <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 11px;">
                &copy; ${new Date().getFullYear()} JM Creations. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Sends a Welcome / Access Granted email to a newly invited Intern.
 *
 * @param {string} name - Intern's full name
 * @param {string} email - Intern's email address
 * @param {string} tempPassword - Temporary password assigned to the account
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendWelcomeEmail = async (name, email, tempPassword) => {
  // Determine frontend URL
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const loginUrl = `${frontendUrl}/login`;

  // Create SMTP transporter using nodemailer
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = getWelcomeEmailTemplate(name, email, tempPassword, loginUrl);
  const textContent = `Welcome to JM Creations CRM\n\nYour workspace access is successfully configured\n\nHello ${name || 'Team Member'},\n\nYou have been granted access to the CRM platform. Below are your account access credentials:\n\nUSERNAME: ${email}\nPASSWORD: ${tempPassword}\n\nAccess Workspace: ${loginUrl}\n\nIf you did not request this, please ignore this email.`;

  const mailOptions = {
    from: `"JM Creations CRM" <${process.env.EMAIL_USER || 'no-reply@jmcreation.in'}>`,
    to: email,
    subject: 'Welcome to JM Creations CRM - Workspace Access Granted',
    text: textContent,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendWelcomeEmail,
};

