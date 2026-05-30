import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

type MailInput = {
  to: string;
  fullName: string;
};

type VerificationEmailInput = MailInput & {
  verifyUrl: string;
  expiresInMinutes: number;
};

type PasswordResetEmailInput = MailInput & {
  resetUrl: string;
  expiresInMinutes: number;
};

type PasswordResetSuccessEmailInput = MailInput & {
  changedAt: Date;
  browser?: string | null;
  ipAddress?: string | null;
};

let transporter: Awaited<ReturnType<typeof createTransporter>> | null | undefined;

async function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    return null;
  }

  try {
    const mod = await import("nodemailer");
    return mod.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } catch (error) {
    logger.warn("Nodemailer is unavailable; falling back to console email logging", error);
    return null;
  }
}

async function getTransporter() {
  if (transporter !== undefined) return transporter;
  transporter = await createTransporter();
  return transporter;
}

function pageTemplate(input: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
}) {
  return `
    <div style="margin:0;background:#07090d;color:#f4f5f7;font-family:Arial,sans-serif;padding:32px 16px">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(255,255,255,.08);border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#111317 0%,#0d1015 100%);box-shadow:0 32px 80px rgba(0,0,0,.35)">
        <div style="padding:32px 32px 22px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06)">
          <div style="font-size:11px;letter-spacing:.42em;text-transform:uppercase;color:#9da7bd">${input.eyebrow}</div>
          <div style="margin-top:14px;font-size:34px;font-weight:300;line-height:1.08">${input.title}</div>
        </div>
        <div style="padding:34px 32px 36px">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.85;color:#d2d6de">${input.body}</p>
          <p style="margin:30px 0 24px;text-align:center">
            <a href="${input.ctaUrl}" style="display:inline-block;background:#f4f5f7;color:#111317;text-decoration:none;padding:15px 28px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:.01em">
              ${input.ctaLabel}
            </a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.8;color:#9da7bd">${input.footer}</p>
        </div>
      </div>
    </div>
  `;
}

function sendMailFallback(label: string, recipient: string, url: string) {
  logger.info(`${label} for ${recipient}: ${url}`);
}

export async function sendVerificationEmail(input: VerificationEmailInput) {
  const mailer = await getTransporter();
  const subject = "Verify Your Doctor House Account";
  const html = pageTemplate({
    eyebrow: "Doctor House",
    title: "Verify your email address",
    body: `Hello ${input.fullName}, please confirm your Doctor House account using the secure link below. This keeps your profile and client portal protected and ensures the account is activated only by you.`,
    ctaLabel: "Verify email",
    ctaUrl: input.verifyUrl,
    footer: `This link expires in ${input.expiresInMinutes} minutes. If you did not request this account, you can safely ignore this email.`,
  });
  const text = [
    `Hello ${input.fullName},`,
    `Verify your Doctor House account: ${input.verifyUrl}`,
    `This link expires in ${input.expiresInMinutes} minutes.`,
  ].join("\n\n");

  if (!mailer || !env.SMTP_FROM) {
    sendMailFallback("Verification link", input.to, input.verifyUrl);
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject,
    html,
    text,
  });
}

export async function sendWelcomeEmail(input: MailInput) {
  const mailer = await getTransporter();
  const subject = "Welcome to Doctor House";
  const html = pageTemplate({
    eyebrow: "Account verified",
    title: "Welcome to Doctor House",
    body: `Hello ${input.fullName}, your account has been verified successfully. You can now access your Doctor House client portal, view updates, save interests, and continue your private medical-commercial journey.`,
    ctaLabel: "Open login",
    ctaUrl: `${env.CLIENT_URL}/login?verified=1`,
    footer: "If you did not verify this account, contact the Doctor House team immediately.",
  });
  const text = [
    `Hello ${input.fullName},`,
    "Your Doctor House account has been successfully verified.",
    `Open login: ${env.CLIENT_URL}/login?verified=1`,
  ].join("\n\n");

  if (!mailer || !env.SMTP_FROM) {
    sendMailFallback("Welcome email", input.to, `${env.CLIENT_URL}/login?verified=1`);
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const mailer = await getTransporter();
  const subject = "Reset Your Doctor House Password";
  const html = pageTemplate({
    eyebrow: "Secure recovery",
    title: "Reset your password",
    body: `Hello ${input.fullName}, we received a request to reset your Doctor House password. Use the secure link below to create a new password. The link is one-time use and expires shortly.`,
    ctaLabel: "Reset password",
    ctaUrl: input.resetUrl,
    footer: `This link expires in ${input.expiresInMinutes} minutes. If you didn't request it, you can ignore this message.`,
  });
  const text = [
    `Hello ${input.fullName},`,
    `Reset your Doctor House password: ${input.resetUrl}`,
    `This link expires in ${input.expiresInMinutes} minutes.`,
  ].join("\n\n");

  if (!mailer || !env.SMTP_FROM) {
    sendMailFallback("Password reset link", input.to, input.resetUrl);
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetSuccessEmail(input: PasswordResetSuccessEmailInput) {
  const mailer = await getTransporter();
  const subject = "Your Doctor House Password Was Changed";
  const browserInfo = input.browser ? `Browser: ${input.browser}` : "Browser: Not available";
  const ipInfo = input.ipAddress ? `IP: ${input.ipAddress}` : "IP: Not available";
  const changedAtLabel = input.changedAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const html = pageTemplate({
    eyebrow: "Security notice",
    title: "Password updated",
    body: `Hello ${input.fullName}, your Doctor House password was successfully changed at ${changedAtLabel}. ${browserInfo}. ${ipInfo}. If this wasn't you, please contact the Doctor House team immediately.`,
    ctaLabel: "Open login",
    ctaUrl: `${env.CLIENT_URL}/login`,
    footer: "This is an automatic security notification from Doctor House.",
  });
  const text = [
    `Hello ${input.fullName},`,
    `Your Doctor House password was successfully changed at ${changedAtLabel}.`,
    browserInfo,
    ipInfo,
    `Open login: ${env.CLIENT_URL}/login`,
  ].join("\n\n");

  if (!mailer || !env.SMTP_FROM) {
    sendMailFallback("Password reset success email", input.to, `${env.CLIENT_URL}/login`);
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject,
    html,
    text,
  });
}
