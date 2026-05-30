import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import { createRequire } from "node:module";
import type { Express } from "express";
import { env } from "../config/env.js";

const require = createRequire(import.meta.url);
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

export function applySecurity(app: Express) {
  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins.length > 1 ? allowedOrigins : allowedOrigins[0],
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(mongoSanitize());
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}
