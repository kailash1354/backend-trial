import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { env } from "../src/config/env.js";

type CollectionIndex = {
  key: Record<string, 1 | -1 | "text" | "hashed" | "2dsphere" | "2d">;
  name: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
  collation?: unknown;
  partialFilterExpression?: Record<string, unknown>;
  background?: boolean;
};

async function ensureTargetCollection(targetDb: mongoose.Connection["db"], name: string) {
  const collections = await targetDb.listCollections({ name }).toArray();
  if (collections.length === 0) {
    await targetDb.createCollection(name);
  }
}

async function copyIndexes(sourceCollection: mongoose.mongo.Collection, targetCollection: mongoose.mongo.Collection) {
  const indexes = (await sourceCollection.indexes()) as CollectionIndex[];

  for (const index of indexes) {
    if (index.name === "_id_") {
      continue;
    }

    const options: Record<string, unknown> = {
      name: index.name,
      background: index.background,
    };

    if (typeof index.unique === "boolean") {
      options.unique = index.unique;
    }

    if (typeof index.sparse === "boolean") {
      options.sparse = index.sparse;
    }

    if (typeof index.expireAfterSeconds === "number") {
      options.expireAfterSeconds = index.expireAfterSeconds;
    }

    if (index.collation) {
      options.collation = index.collation as never;
    }

    if (index.partialFilterExpression) {
      options.partialFilterExpression = index.partialFilterExpression;
    }

    await targetCollection.createIndex(index.key, options);
  }
}

async function syncCollection(
  sourceDb: mongoose.Connection["db"],
  targetDb: mongoose.Connection["db"],
  name: string,
  overwrite = false,
) {
  const sourceCollection = sourceDb.collection(name);
  const targetCollection = targetDb.collection(name);

  await ensureTargetCollection(targetDb, name);
  await copyIndexes(sourceCollection, targetCollection);

  const documents = await sourceCollection.find({}).toArray();
  if (overwrite) {
    await targetCollection.deleteMany({});
  }

  if (documents.length === 0) {
    console.log(`Collection ${name}: no documents to copy`);
    return;
  }

  if (overwrite) {
    await targetCollection.insertMany(documents, { ordered: true });
  } else {
    const operations = documents.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }));

    await targetCollection.bulkWrite(operations, { ordered: false });
  }

  console.log(`Collection ${name}: copied ${documents.length} documents`);
}

async function main() {
  await connectDb();

  const client = mongoose.connection.getClient();
  const sourceDbName = process.env.MIGRATE_SOURCE_DB_NAME?.trim() || "test";
  const sourceDb = client.db(sourceDbName);
  const targetDb = client.db(env.MONGODB_DB_NAME);
  const overwrite = process.env.MIGRATE_TEST_DB_OVERWRITE === "true";

  const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

  for (const { name } of collections) {
    if (!name || name.startsWith("system.")) {
      continue;
    }

    await syncCollection(sourceDb, targetDb, name, overwrite);
  }

  await mongoose.disconnect();
  console.log(`Migration complete: ${sourceDbName} -> ${env.MONGODB_DB_NAME}`);
}

main().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
