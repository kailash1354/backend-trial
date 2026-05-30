import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const envCandidates = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
];

dotenv.config({
  path: envCandidates.find((candidate) => existsSync(candidate)),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_NAME: z.string().min(1).default("Doctor House API"),
  APP_URL: z.string().min(1).default("http://localhost:4000"),
  CLIENT_URL: z.string().min(1).default("http://localhost:8080"),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("Doctor-House-Aditya"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  CORS_ORIGIN: z.string().default("http://localhost:8080,http://localhost:5173"),
  UPLOAD_PROVIDER: z.enum(["local", "cloud"]).default("local"),
  UPLOAD_DIR: z.string().default("uploads"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(60),
  EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: z.coerce.number().default(60),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  ADMIN_SEED_EMAIL: z.string().optional(),
  ADMIN_SEED_PASSWORD: z.string().optional(),
  ADMIN_SEED_NAME: z.string().optional(),
  ADMIN_SEED_ROLES: z.string().optional(),
});

export const env = envSchema.parse(process.env);
