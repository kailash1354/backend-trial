import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";
import routes from "./routes/index.js";
import { applySecurity } from "./middlewares/security.middleware.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();
  applySecurity(app);

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, status: "healthy" });
  });

  app.use("/api/v1", routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
