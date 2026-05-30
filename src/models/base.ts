import { Schema } from "mongoose";

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false as const,
};

export function softDeleteFields(schema: Schema) {
  schema.add({ deletedAt: { type: Date, default: null } });
}
