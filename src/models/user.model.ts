import { Schema, model } from "mongoose";
import { baseSchemaOptions, softDeleteFields } from "./base.js";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    roles: { type: [String], default: ["user"], index: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpiresAt: { type: Date, default: null },
    emailVerificationSentAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    refreshTokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetTokenExpiresAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  baseSchemaOptions,
);
softDeleteFields(userSchema);

export const UserModel = model("User", userSchema);
