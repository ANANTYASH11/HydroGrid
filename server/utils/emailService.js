/**
 * Email Service
 * Handles sending emails using Gmail API or SMTP
 * Used for alerts, notifications, and user communications
 */

const nodemailer = require('nodemailer');

// Determine which auth method to use
const useGmailApi = process.env.GMAIL_SERVICE_ACCOUNT && process.env.GMAIL_CLIENT_EMAIL;

let smtpConfig;

if (useGmailApi) {
  // Gmail API with Service Account (works on Render)
  try {
    const serviceAccount = JSON.parse(process.env.GMAIL_SERVICE_ACCOUNT);
    
    smtpConfig = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_CLIENT_EMAIL,
        serviceClient: process.env.GMAIL_CLIENT_ID,
        privateKey: serviceAccount.private_key,
        accessUrl: 'https://oauth2.googleapis.com/token',
      }
    };
    console.log('📧 Using Gmail API authentication (service account)');
  } catch (error) {
    console.error('❌ Failed to parse GMAIL_SERVICE_ACCOUNT:', error.message);
    smtpConfig = null;
  }
} else {
  // Standard SMTP configuration (Gmail SMTP or other providers)
  const determineSecurity = () => {
    const port = parseInt(process.env.SMTP_PORT, 10);
    const secureEnv = process.env.SMTP_SECURE;
    
    if (secureEnv === 'true') return true;
    if (secureEnv === 'false') return false;
    if (port === 465) return true;
    if (port === 2525) return false;
    if (port === 587) return false;
    return false;
  };

  smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: determineSecurity(),
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    },
    pool: {
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10,
    },
    connectionTimeout: 15000,
    socketTimeout: 15000,
    greetingTimeout: 10000,
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
  };
}

// Validate configuration
if (!smtpConfig) {
  console.error('❌ CRITICAL: Email configuration failed!');
  console.error('   Using Gmail API requires:');
  console.error('   - GMAIL_SERVICE_ACCOUNT (JSON string)');
  console.error('   - GMAIL_CLIENT_EMAIL (service account email)');
  console.error('   - GMAIL_CLIENT_ID (service account client ID)');
}

if (smtpConfig && !useGmailApi && (!smtpConfig.auth.user || !smtpConfig.auth.pass)) {
  console.error('❌ CRITICAL: SMTP credentials missing!');
  console.error('   Set SMTP_USER and SMTP_PASS, or use Gmail API');
}

// SENDER_EMAIL can be different from auth user
const SENDER_EMAIL = (process.env.SENDER_EMAIL || process.env.GMAIL_CLIENT_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@hydrogrid.com').trim();

let transporter = null;

// Initialize transporter with error handling
const initializeTransporter = () => {
  try {
    transporter = nodemailer.createTransport(smtpConfig);
    
    // Verify SMTP connection on startup
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection failed:', error.message);
        console.error('   Host:', smtpConfig.host);
        console.error('   Port:', smtpConfig.port);
        console.error('   User:', smtpConfig.auth.user);
      } else {
        console.log('✅ SMTP connection verified successfully');
        console.log('   Host:', smtpConfig.host);
        console.log('   Port:', smtpConfig.port);
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

transporter = initializeTransporter();

/**
 * Send an alert email to a user
 * @param {Object} user - User object with email and name
 * @param {Object} alert - Alert object with type, severity, message, etc.
 */
const sendAlertEmail = async (user, alert) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized. Check SMTP credentials.');
    }

    if (!user || !user.email) {
      console.error('❌ sendAlertEmail: Invalid user object', { userId: user?.id, userEmail: user?.email });
      throw new Error('Invalid user object: email is required');
    }

    const recipientEmail = user.email.trim();
    const subject = getAlertSubject(alert);
    const htmlContent = getAlertEmailTemplate(user, alert);

    const mailOptions = {
      from: `"HydroGrid Alert System" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      priority: alert.severity === 'red' ? 'high' : 'normal',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Alert email sent successfully to ${recipientEmail} for user ${user.id} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: recipientEmail };
  } catch (error) {
    console.error(`❌ Failed to send alert email to ${user?.email}:`, error.message);
    return { success: false, error: error.message, recipient: user?.email };
  }
};

/**
 * Send a welcome email to new users
 * @param {Object} user - User object with email and name
 */
const sendWelcomeEmail = async (user) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized. Check SMTP credentials.');
    }

    if (!user || !user.email) {
      console.error('❌ sendWelcomeEmail: Invalid user object', { userId: user?.id, userEmail: user?.email });
      throw new Error('Invalid user object: email is required');
    }

    const recipientEmail = user.email.trim();
    const mailOptions = {
      from: `"HydroGrid Team" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: 'Welcome to HydroGrid - Smart Water & Electricity Intelligence',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to HydroGrid, ${user.name || 'User'}!</h2>
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
    console.log(`✅ Welcome email sent successfully to ${recipientEmail} for user ${user.id} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: recipientEmail };
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${user?.email}:`, error.message);
    return { success: false, error: error.message, recipient: user?.email };
  }
};

/**
 * Send a password reset email
 * @param {Object} user - User object with email and name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized. Check SMTP credentials.');
    }

    if (!user || !user.email) {
      console.error('❌ sendPasswordResetEmail: Invalid user object', { userId: user?.id, userEmail: user?.email });
      throw new Error('Invalid user object: email is required');
    }

    if (!resetToken) {
      throw new Error('Reset token is required');
    }

    const recipientEmail = user.email.trim();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"HydroGrid Security" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: 'Password Reset Request - HydroGrid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hello ${user.name || 'User'},</p>
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
    console.log(`✅ Password reset email sent successfully to ${recipientEmail} for user ${user.id} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: recipientEmail };
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${user?.email}:`, error.message);
    return { success: false, error: error.message, recipient: user?.email };
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
 * Send a login alert email to user
 * @param {Object} user - User object with email and name
 * @param {Object} loginInfo - Login info with IP, device, location
 */
const sendLoginAlertEmail = async (user, loginInfo = {}) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized. Check SMTP credentials.');
    }

    if (!user || !user.email) {
      console.error('❌ sendLoginAlertEmail: Invalid user object', { userId: user?.id, userEmail: user?.email });
      throw new Error('Invalid user object: email is required');
    }

    const recipientEmail = user.email.trim();

    const loginTime = new Date().toLocaleString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });

    const mailOptions = {
      from: `"HydroGrid Security" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: '🔐 Login Alert - HydroGrid Account Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">🔐 Account Login Alert</h2>
          </div>
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 20px;">
            <p>Hello ${user.name || 'User'},</p>

            <p>Your HydroGrid account was just accessed. Here are the login details:</p>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <strong>Login Time:</strong><br>
              ${loginTime}<br><br>
              
              <strong>Account Email:</strong><br>
              ${user.email}<br><br>
              
              ${loginInfo.ipAddress ? `<strong>IP Address:</strong><br>${loginInfo.ipAddress}<br><br>` : ''}
              
              ${loginInfo.device ? `<strong>Device:</strong><br>${loginInfo.device}<br><br>` : ''}
              
              ${loginInfo.location ? `<strong>Location:</strong><br>${loginInfo.location}<br><br>` : ''}
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h4 style="margin-top: 0; color: #92400e;">⚠️ Security Tip:</h4>
              <ul style="margin-bottom: 0;">
                <li>If this wasn't you, change your password immediately</li>
                <li>Enable two-factor authentication for extra security</li>
                <li>Review your recent account activity</li>
                <li>Contact support if you see suspicious activity</li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This is an automated security alert. Your HydroGrid account is protected by our security systems.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              HydroGrid - Smart Water & Electricity Intelligence Platform<br>
              © 2026 HydroGrid. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Login alert email sent successfully to ${recipientEmail} for user ${user.id} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: recipientEmail };
  } catch (error) {
    console.error(`❌ Failed to send login alert email to ${user?.email}:`, error.message);
    return { success: false, error: error.message, recipient: user?.email };
  }
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
  sendLoginAlertEmail,
  testEmailConnection,
  transporter,
};