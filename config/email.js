// backend/config/email.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  smtp: {
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "test@example.com",
    pass: process.env.SMTP_PASS || "testpassword",
  },
  from: process.env.FROM_EMAIL || "noreply@yourapp.com",
};
