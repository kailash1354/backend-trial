import { UserModel } from "../models/user.model.js";

export const UserRepository = {
  findByEmail: (email: string) => UserModel.findOne({ email, deletedAt: null }),
  findById: (id: string) => UserModel.findOne({ _id: id, deletedAt: null }),
  findByPasswordResetTokenHash: (tokenHash: string) =>
    UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      deletedAt: null,
    }),
  findByEmailVerificationTokenHash: (tokenHash: string) =>
    UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
      deletedAt: null,
    }),
  create: (payload: {
    email: string;
    passwordHash: string;
    fullName: string;
    roles?: string[];
    passwordChangedAt?: Date;
    isEmailVerified?: boolean;
    emailVerificationTokenHash?: string | null;
    emailVerificationExpiresAt?: Date | null;
    emailVerificationSentAt?: Date | null;
    verifiedAt?: Date | null;
  }) =>
    UserModel.create(payload),
  bumpRefreshVersion: (id: string) =>
    UserModel.findByIdAndUpdate(id, { $inc: { refreshTokenVersion: 1 } }, { new: true }),
  saveEmailVerificationToken: (id: string, tokenHash: string, expiresAt: Date) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          emailVerificationTokenHash: tokenHash,
          emailVerificationExpiresAt: expiresAt,
          emailVerificationSentAt: new Date(),
        },
      },
      { new: true },
    ),
  clearEmailVerificationToken: (id: string) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          emailVerificationTokenHash: null,
          emailVerificationExpiresAt: null,
          emailVerificationSentAt: null,
        },
      },
      { new: true },
    ),
  markEmailVerified: (id: string) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isEmailVerified: true,
          verifiedAt: new Date(),
          emailVerificationTokenHash: null,
          emailVerificationExpiresAt: null,
          emailVerificationSentAt: null,
        },
      },
      { new: true },
    ),
  savePasswordResetToken: (id: string, tokenHash: string, expiresAt: Date) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetTokenExpiresAt: expiresAt,
        },
      },
      { new: true },
    ),
  clearPasswordResetToken: (id: string) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          passwordResetTokenHash: null,
          passwordResetTokenExpiresAt: null,
        },
      },
      { new: true },
    ),
  updatePassword: (id: string, passwordHash: string) =>
    UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          passwordHash,
          passwordChangedAt: new Date(),
          passwordResetTokenHash: null,
          passwordResetTokenExpiresAt: null,
        },
        $inc: { refreshTokenVersion: 1 },
      },
      { new: true },
    ),
};
