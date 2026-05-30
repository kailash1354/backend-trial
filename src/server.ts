import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { logger } from "./config/logger.js";

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Backend listening on ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error("Backend startup failed", err);
  process.exit(1);
});
