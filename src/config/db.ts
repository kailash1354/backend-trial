import mongoose from "mongoose";
import { env } from "./env.js";

export function resolveMongoUri(uri: string, dbName: string) {
  const resolved = new URL(uri);
  if (!resolved.pathname || resolved.pathname === "/") {
    resolved.pathname = `/${dbName}`;
  }
  return resolved.toString();
}

export async function connectDb() {
  await mongoose.connect(resolveMongoUri(env.MONGODB_URI, env.MONGODB_DB_NAME), {
    dbName: env.MONGODB_DB_NAME,
  });
}
