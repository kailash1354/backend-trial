import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRepository } from "../repositories/user.repository.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email.service.js";
import { HttpError } from "../utils/http.js";

const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];
const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];
const LEGACY_PLACEHOLDER_NAMES = new Set(["Peter Parker"]);

function normalizeDisplayName(name: string | undefined | null, fallback: string) {
  const value = name?.trim() ?? "";
  if (value.length === 0) return fallback;
  if (LEGACY_PLACEHOLDER_NAMES.has(value)) return fallback;
  return value;
}

function signAccessToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });
}

function signRefreshToken(userId: string, version: number) {
  return jwt.sign({ sub: userId, v: version }, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });
}

function serializeUser(user: {
  _id: unknown;
  roles: string[];
  email: string;
  fullName: string;
  isEmailVerified?: boolean;
}) {
  const emailFallback = user.email.split("@")[0]?.trim() || "Member";
  return {
    userId: String(user._id),
    roles: user.roles,
    email: user.email,
    fullName: normalizeDisplayName(user.fullName, emailFallback),
    isEmailVerified: Boolean(user.isEmailVerified),
  };
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function buildVerificationUrl(token: string) {
  const url = new URL("/api/v1/auth/verify-email", env.APP_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

function buildResetUrl(token: string) {
  return `${env.CLIENT_URL}/reset-password/${token}`;
}

async function issueAuthTokens(user: {
  _id: unknown;
  roles: string[];
  refreshTokenVersion?: number | null;
}) {
  const accessToken = signAccessToken(String(user._id), user.roles);
  const refreshToken = signRefreshToken(String(user._id), user.refreshTokenVersion ?? 0);
  return { accessToken, refreshToken };
}

async function sendVerificationForUser(user: {
  _id: unknown;
  email: string;
  fullName: string;
}, token: string) {
  await sendVerificationEmail({
    to: user.email,
    fullName: user.fullName,
    verifyUrl: buildVerificationUrl(token),
    expiresInMinutes: env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES,
  });
}

export const AuthService = {
  async register(input: { fullName: string; email: string; password: string }) {
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      if (!existing.isEmailVerified) {
        throw new HttpError(409, "Account exists but email is not verified", {
          code: "EMAIL_NOT_VERIFIED",
        });
      }
      throw new HttpError(409, "Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const verificationToken = generateToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpiresAt = new Date(
      Date.now() + env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    const user = await UserRepository.create({
      fullName,
      email,
      passwordHash,
      roles: ["user"],
      isEmailVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiresAt: verificationExpiresAt,
      emailVerificationSentAt: new Date(),
      verifiedAt: null,
    });

    await sendVerificationForUser({
      _id: user._id,
      email: user.email,
      fullName: normalizeDisplayName(user.fullName, "Member"),
    }, verificationToken);

    return {
      email: user.email,
      verificationRequired: true,
    };
  },

  async signup(input: { fullName: string; email: string; password: string }) {
    return AuthService.register(input);
  },

  async resendVerification(input: { email: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(email);
    if (!user || user.isEmailVerified) {
      return { sent: true };
    }

    if (user.emailVerificationSentAt) {
      const elapsed = Date.now() - user.emailVerificationSentAt.getTime();
      if (elapsed < 60 * 1000) {
        throw new HttpError(429, "Please wait a moment before requesting another email");
      }
    }

    const verificationToken = generateToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpiresAt = new Date(
      Date.now() + env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    await UserRepository.saveEmailVerificationToken(String(user._id), verificationTokenHash, verificationExpiresAt);
    await sendVerificationForUser({
      _id: user._id,
      email: user.email,
      fullName: normalizeDisplayName(user.fullName, "Member"),
    }, verificationToken);

    return { sent: true };
  },

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const user = await UserRepository.findByEmailVerificationTokenHash(tokenHash);
    if (!user) {
      throw new HttpError(400, "Verification link is invalid or expired");
    }

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new HttpError(400, "Verification link is invalid or expired");
    }

    const updated = await UserRepository.markEmailVerified(String(user._id));
    if (!updated) {
      throw new HttpError(404, "User not found");
    }

    await sendWelcomeEmail({
      to: updated.email,
      fullName: normalizeDisplayName(updated.fullName, "Member"),
    });

    return serializeUser(updated);
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    if (!user.isEmailVerified) {
      throw new HttpError(403, "Please verify your email address.", {
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);
    return { user: serializeUser(user), accessToken, refreshToken };
  },

  async refresh(token: string) {
    let payload: { sub: string; v: number };
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; v: number };
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }

    const user = await UserRepository.findById(payload.sub);
    if (!user || user.refreshTokenVersion !== payload.v) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const next = await UserRepository.bumpRefreshVersion(String(user._id));
    if (!next) throw new HttpError(404, "User not found");
    const { accessToken, refreshToken } = await issueAuthTokens(next);
    return { accessToken, refreshToken, user: serializeUser(next) };
  },

  async logoutEverywhere(userId: string) {
    await UserRepository.bumpRefreshVersion(userId);
  },

  async forgotPassword(input: { email: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await UserRepository.savePasswordResetToken(String(user._id), resetTokenHash, resetTokenExpiresAt);

    await sendPasswordResetEmail({
      to: user.email,
      fullName: normalizeDisplayName(user.fullName, "Member"),
      resetUrl: buildResetUrl(resetToken),
      expiresInMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
    });
  },

  async resetPassword(input: { token: string; password: string; browser?: string | null; ipAddress?: string | null }) {
    const tokenHash = hashToken(input.token);
    const user = await UserRepository.findByPasswordResetTokenHash(tokenHash);
    if (!user) {
      throw new HttpError(400, "Reset link is invalid or expired");
    }

    if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      throw new HttpError(400, "Reset link is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const updated = await UserRepository.updatePassword(String(user._id), passwordHash);
    if (!updated) {
      throw new HttpError(404, "User not found");
    }

    await sendPasswordResetSuccessEmail({
      to: updated.email,
      fullName: normalizeDisplayName(updated.fullName, "Member"),
      changedAt: updated.passwordChangedAt ?? new Date(),
      browser: input.browser ?? null,
      ipAddress: input.ipAddress ?? null,
    });
  },
};
