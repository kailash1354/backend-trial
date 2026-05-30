import { createApp } from "../src/app.js";
import { connectDb } from "../src/config/db.js";

const app = createApp();

let dbConnection: Promise<void> | undefined;

async function ensureDbConnection() {
  if (!dbConnection) {
    dbConnection = connectDb().catch((error) => {
      dbConnection = undefined;
      throw error;
    });
  }

  return dbConnection;
}

export default async function handler(req: any, res: any) {
  await ensureDbConnection();
  return app(req, res);
}
