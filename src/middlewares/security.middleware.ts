import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import type { Express } from "express";
import { env } from "../config/env.js";

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
