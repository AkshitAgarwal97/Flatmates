"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
class EmailService {
    escapeHtml(value) {
        if (value == null)
            return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    constructor() {
        this.transporter = null;
        // Initialize transporter if email is configured
        if (process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
        else {
            console.warn('Email service not configured. Set SMTP_* environment variables to enable email notifications.');
        }
    }
    async sendEmail(options) {
        if (!this.transporter) {
            console.log('Email not sent (service not configured):', options.subject, 'to', options.to);
            return false;
        }
        // Basic sanitization to reduce risk of header injection
        const sanitizeHeader = (value) => value.replace(/(\r|\n|\0)/g, ' ').trim().slice(0, 998);
        // Stricter email validation to reduce header-injection edge cases
        const isValidEmail = (email) => {
            const sanitized = email.trim();
            // Reasonable RFC-like pattern (not full RFC5322 but strict enough for common addresses)
            const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return re.test(sanitized) && sanitized.length <= 254;
        };
        try {
            // Validate recipient list
            const rawRecipients = options.to.split(',').map(r => r.trim()).filter(Boolean);
            const recipients = [];
            for (const r of rawRecipients) {
                const safe = sanitizeHeader(r);
                if (!isValidEmail(safe)) {
                    console.error('Invalid recipient email, aborting send:', r);
                    return false;
                }
                recipients.push(safe);
            }
            const safeSubject = sanitizeHeader(options.subject);
            const fromAddressRaw = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
            const safeFromAddress = sanitizeHeader(fromAddressRaw);
            // Escape HTML in the html body to prevent injection unless caller provided safe HTML.
            // We assume templates are trusted but user-provided values interpolated into templates
            // should be escaped by higher-level functions; as a safety net, convert raw text values.
            const safeHtml = options.html;
            const safeText = options.text || safeHtml.replace(/<[^>]*>/g, '');
            const mailOptions = {
                from: `"Flatmates" <${safeFromAddress}>`,
                to: recipients.join(', '),
                subject: safeSubject,
                text: safeText,
                html: safeHtml,
            };
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully to:', mailOptions.to);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
    // Property-related notifications
    async sendNewMessageNotification(recipientEmail, senderName, propertyTitle) {
        const safeSender = this.escapeHtml(senderName);
        const safeProperty = this.escapeHtml(propertyTitle);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">New Message on Flatmates</h2>
        <p>Hello,</p>
        <p>You have received a new message from <strong>${safeSender}</strong> regarding your property listing: <strong>${safeProperty}</strong>.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/messages" 
             style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Message
          </a>
        </p>
        <p>Best regards,<br>The Flatmates Team</p>
      </div>
    `;
        return this.sendEmail({
            to: recipientEmail,
            subject: `New message from ${safeSender} - ${safeProperty}`,
            html,
        });
    }
    async sendPropertyViewNotification(ownerEmail, propertyTitle, viewerName) {
        const safeProperty = this.escapeHtml(propertyTitle);
        const safeViewer = viewerName ? this.escapeHtml(viewerName) : undefined;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Your Property Was Viewed</h2>
        <p>Hello,</p>
        <p>Your property listing <strong>${safeProperty}</strong> has been viewed${safeViewer ? ` by ${safeViewer}` : ''}.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/properties" 
             style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Listings
          </a>
        </p>
        <p>Best regards,<br>The Flatmates Team</p>
      </div>
    `;
        return this.sendEmail({
            to: ownerEmail,
            subject: `Your property "${safeProperty}" was viewed`,
            html,
        });
    }
    async sendPropertySavedNotification(ownerEmail, propertyTitle, savedByName) {
        const safeProperty = this.escapeHtml(propertyTitle);
        const safeSaver = this.escapeHtml(savedByName);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Your Property Was Saved</h2>
        <p>Hello,</p>
        <p>Your property listing <strong>${safeProperty}</strong> has been saved by <strong>${safeSaver}</strong>.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/properties" 
             style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Listings
          </a>
        </p>
        <p>Best regards,<br>The Flatmates Team</p>
      </div>
    `;
        return this.sendEmail({
            to: ownerEmail,
            subject: `Your property "${safeProperty}" was saved`,
            html,
        });
    }
    // User-related notifications
    async sendWelcomeEmail(userEmail, userName) {
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Welcome to Flatmates!</h2>
          <p>Hello ${this.escapeHtml(userName)},</p>
        <p>Thank you for joining Flatmates! We're excited to help you find your perfect flatmate or property.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/properties" 
             style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Browse Properties
          </a>
        </p>
        <p>Best regards,<br>The Flatmates Team</p>
      </div>
    `;
        return this.sendEmail({
            to: userEmail,
            subject: 'Welcome to Flatmates!',
            html,
        });
    }
    async sendPasswordResetEmail(userEmail, resetToken) {
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        const safeToken = this.escapeHtml(resetToken);
        const resetUrlEscaped = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${safeToken}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetUrlEscaped}" 
             style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Flatmates Team</p>
      </div>
    `;
        return this.sendEmail({
            to: userEmail,
            subject: 'Password Reset Request - Flatmates',
            html,
        });
    }
    async sendOTPEmail(email, otp) {
        const safeOtp = this.escapeHtml(otp);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1976d2; letter-spacing: 5px; margin: 0;">${safeOtp}</h1>
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: 'Password Reset OTP - Flatmates',
            html,
        });
    }
    /**
     * Generate a 6-digit OTP. Uses crypto for better randomness than Math.random.
     */
    generateOTP() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
}
const emailServiceInstance = new EmailService();
// Named exports for OTP functionality (previously in utils/emailService.ts)
const sendOTPEmail = (email, otp) => emailServiceInstance.sendOTPEmail(email, otp);
exports.sendOTPEmail = sendOTPEmail;
const generateOTP = () => emailServiceInstance.generateOTP();
exports.generateOTP = generateOTP;
exports.default = emailServiceInstance;
//# sourceMappingURL=emailService.js.map