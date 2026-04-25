/**
 * Email Service
 * Handles sending emails using Mailtrap SMTP
 * Used for alerts, notifications, and user communications
 */

const nodemailer = require('nodemailer');

// Create reusable transporter object using environment-configured SMTP
const smtpConfig = {
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT, 10) || 2525,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '57a188918ca1a8',
    pass: process.env.SMTP_PASS || 'fb9a74c65697eb',
  },
};

if (!process.env.SMTP_HOST) {
  console.warn('⚠️ Email service is using Mailtrap sandbox transport. Real email delivery requires SMTP_HOST, SMTP_USER, and SMTP_PASS configuration.');
}

const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Send an alert email to a user
 * @param {Object} user - User object with email and name
 * @param {Object} alert - Alert object with type, severity, message, etc.
 */
const sendAlertEmail = async (user, alert) => {
  try {
    const subject = getAlertSubject(alert);
    const htmlContent = getAlertEmailTemplate(user, alert);

    const mailOptions = {
      from: `"HydroGrid Alert System" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Alert email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send alert email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a welcome email to new users
 * @param {Object} user - User object with email and name
 */
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"HydroGrid Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to HydroGrid - Smart Water & Electricity Intelligence',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to HydroGrid, ${user.name}!</h2>
          <p>Thank you for joining our Smart Water & Electricity Intelligence Platform.</p>
          <p>You will now receive alerts and notifications about your usage patterns, potential savings, and system updates.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What you can expect:</h3>
            <ul>
              <li>Real-time usage monitoring</li>
              <li>Threshold alerts for high consumption</li>
              <li>Carbon footprint tracking</li>
              <li>Cost estimation and savings tips</li>
              <li>AI-powered usage predictions</li>
            </ul>
          </div>
          <p>Start by adding your first usage reading or connecting your smart meters!</p>
          <p>Best regards,<br>The HydroGrid Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a password reset email
 * @param {Object} user - User object with email and name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"HydroGrid Security" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - HydroGrid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your HydroGrid account.</p>
          <p>Please click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The HydroGrid Security Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate alert email subject based on severity
 * @param {Object} alert - Alert object
 * @returns {string} Email subject
 */
const getAlertSubject = (alert) => {
  const severity = alert.severity.toLowerCase();
  const type = alert.type.charAt(0).toUpperCase() + alert.type.slice(1);

  switch (severity) {
    case 'red':
      return `🚨 CRITICAL: ${type} Usage Alert - HydroGrid`;
    case 'yellow':
      return `⚠️ WARNING: ${type} Usage Alert - HydroGrid`;
    default:
      return `📊 ${type} Usage Notice - HydroGrid`;
  }
};

/**
 * Generate HTML email template for alerts
 * @param {Object} user - User object
 * @param {Object} alert - Alert object
 * @returns {string} HTML email content
 */
const getAlertEmailTemplate = (user, alert) => {
  const severity = alert.severity.toLowerCase();
  let headerColor = '#10b981'; // green
  let icon = '📊';

  if (severity === 'yellow') {
    headerColor = '#f59e0b'; // yellow
    icon = '⚠️';
  } else if (severity === 'red') {
    headerColor = '#ef4444'; // red
    icon = '🚨';
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${headerColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">${icon} HydroGrid Alert</h2>
      </div>
      <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 20px;">
        <p>Hello ${user.name},</p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${headerColor};">
          <h3 style="margin-top: 0; color: ${headerColor};">${alert.message}</h3>
          <div style="margin-top: 15px;">
            <strong>Details:</strong><br>
            • Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}<br>
            • Threshold: ${alert.threshold}<br>
            • Actual Usage: ${alert.actualValue}<br>
            • Time: ${new Date(alert.timestamp).toLocaleString()}<br>
            • Severity: ${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </div>
        </div>

        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1e40af;">💡 Recommendations:</h4>
          <ul style="margin-bottom: 0;">
            <li>Check for leaks or unusual consumption patterns</li>
            <li>Consider adjusting your usage thresholds in settings</li>
            <li>Review your usage history for trends</li>
            <li>Contact support if you need assistance</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          This is an automated alert from HydroGrid. If you have any questions, please contact our support team.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          HydroGrid - Smart Water & Electricity Intelligence Platform<br>
          © 2026 HydroGrid. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return { success: true, message: 'Email service is working' };
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAlertEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  testEmailConnection,
  transporter,
};