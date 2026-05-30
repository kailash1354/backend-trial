import bcrypt from "bcryptjs";
import { env } from "../src/config/env.js";
import { connectDb } from "../src/config/db.js";
import { UserModel } from "../src/models/user.model.js";

function parseRoles(input: string | undefined) {
  if (!input) return ["admin"];
  const roles = input
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
  return roles.length > 0 ? roles : ["admin"];
}

async function seedAdmin() {
  const email = env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_SEED_PASSWORD?.trim();
  const fullName = env.ADMIN_SEED_NAME?.trim() || "JAKK Admin";
  const roles = parseRoles(env.ADMIN_SEED_ROLES);

  if (!email || !password) {
    throw new Error(
      "ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required to seed an admin account.",
    );
  }

  await connectDb();

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const payload = {
    email,
    fullName,
    passwordHash,
    roles,
    isEmailVerified: true,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    emailVerificationSentAt: null,
    verifiedAt: new Date(),
    refreshTokenVersion: 0,
    deletedAt: null,
  };

  const existing = await UserModel.findOne({ email });
  if (existing) {
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.roles = roles;
    existing.isEmailVerified = true;
    existing.emailVerificationTokenHash = null;
    existing.emailVerificationExpiresAt = null;
    existing.emailVerificationSentAt = null;
    existing.verifiedAt = new Date();
    existing.deletedAt = null;
    existing.refreshTokenVersion = 0;
    await existing.save();
    console.log(`Admin account updated for ${email} with roles: ${roles.join(", ")}`);
  } else {
    await UserModel.create(payload);
    console.log(`Admin account created for ${email} with roles: ${roles.join(", ")}`);
  }

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
