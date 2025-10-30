// backend/utils/email.js
import { logger } from "../middleware/errorHandler.js"; // Assumes you have logger imported/defined
import { config } from "../config/email.js"; // Imports configuration using SMTP_* variables
import nodemailer from "nodemailer"; // Simple nodemailer import that works

// --- 1. EMAIL TEMPLATE DEFINITIONS (Fixes the "template not found" error) ---

// These functions generate the subject, HTML, and text body for each email.
const emailTemplates = {
  // 1. ACCOUNT VERIFICATION
  "email-verification": (data) => ({
    subject: "Verify Your Email Address for Luxe Heritage",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Welcome to Luxe Heritage, ${data.firstName}!</h2>
        <p style="color: #555;">Thank you for registering. We are excited to have you.</p>
        <p style="color: #555;">Please click the secure button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Activate My Account
          </a>
        </div>
        <p style="color: #777; font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 10px; color: #aaa; word-break: break-all;">${data.verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="text-align: center; font-size: 11px; color: #aaa;">Luxe Heritage | The finest in e-commerce.</p>
      </div>
    `,
    text: `Welcome, ${data.firstName}! Please copy and paste this link to verify your email address: ${data.verificationUrl}`,
  }),

  // 2. PASSWORD RESET
  "password-reset": (data) => ({
    subject: "Luxe Heritage Password Reset Request",
    html: `
      <p style="font-family: Arial, sans-serif;">Hello ${data.firstName},</p>
      <p style="font-family: Arial, sans-serif;">You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetUrl}"
           style="background-color: #CC0000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #777;">This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>
    `,
    text: `Hello ${data.firstName}, Password reset link: ${data.resetUrl}`,
  }),

  // 3. ORDER CONFIRMATION (Based on your /api/orders flow)
  "order-confirmation": (data) => ({
    subject: `Order Confirmation #${data.orderNumber} - Thank You!`,
    html: `
      <p style="font-family: Arial, sans-serif;">Dear ${data.firstName},</p>
      <p style="font-family: Arial, sans-serif;">Your order has been successfully placed! Here are the details:</p>
      <p style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold;">Order #: ${data.orderNumber}</p>
      <p style="font-family: Arial, sans-serif;">Total Paid: ${data.total}</p>
      <p style="font-family: Arial, sans-serif;">Estimated Delivery: ${data.estimatedDelivery}</p>
      <p style="font-family: Arial, sans-serif;">View your order history for more details.</p>
    `,
    text: `Your order #${data.orderNumber} is confirmed. Total: ${data.total}. Estimated Delivery: ${data.estimatedDelivery}.`,
  }),

  // 4. SHIPPING NOTIFICATION
  "shipping-notification": (data) => ({
    subject: `Your Order #${data.orderNumber} Has Shipped!`,
    html: `
      <p style="font-family: Arial, sans-serif;">Dear ${data.firstName},</p>
      <p style="font-family: Arial, sans-serif;">Great news! Your order has shipped via ${data.carrier}.</p>
      <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Tracking Number: ${data.trackingNumber}</p>
      <p style="font-family: Arial, sans-serif;">You can track your package here: [Tracking Link Placeholder]</p>
    `,
    text: `Your order #${data.orderNumber} has shipped! Tracking number: ${data.trackingNumber}`,
  }),
};

// --- 2. TRANSPORTER CONFIGURATION ---

// Create transporter with error handling
const createTransporter = () => {
  // Use secure: true for port 465 (SSL) and secure: false for port 587 (TLS/STARTTLS)
  const isSecure = config.smtp.port === 465;

  try {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: isSecure, // Use SSL/TLS based on port
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } catch (error) {
    // This warning should ONLY appear if nodemailer itself fails to initialize
    console.log("⚠️  Email transporter failed, using mock:", error.message);
    return null;
  }
};

const transporter = createTransporter();

// --- 3. SEND EMAIL FUNCTION ---

// Send email function with fallback
export const sendEmail = async (options) => {
  try {
    const template = emailTemplates[options.template];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const emailData = template(options.data);
    const senderEmail = config.from || "Luxe Heritage <noreply@yourapp.com>";

    // Mock email if transporter failed (e.g., in a locked-down development environment)
    if (!transporter) {
      logger.warn(`📧 Mock email sent to: ${options.to}`);
      return { messageId: "mock-id", mock: true };
    }

    const mailOptions = {
      from: senderEmail,
      to: options.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    // Log the error but don't crash the running process
    logger.error(`Email failed to ${options.to}. Error:`, error);
    // Return a failed object for the calling controller to handle
    return { messageId: "failed", error: error.message, mock: false };
  }
};

// --- 4. TEST CONFIG FUNCTION (Optional, for server startup check) ---

export const testEmailConfig = async () => {
  if (!transporter) {
    console.log("📧 Email test skipped (transporter failed to initialize)");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email configuration working");
    return true;
  } catch (error) {
    console.log("⚠️  Email test failed:", error.message);
    return false;
  }
};
