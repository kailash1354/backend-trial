import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const savedInterestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["space", "floor-plan", "amenity", "investment", "document"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    href: { type: String, default: "" },
    label: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  baseSchemaOptions,
);

savedInterestSchema.index({ userId: 1, category: 1, title: 1 }, { unique: true });

export const SavedInterestModel = model("SavedInterest", savedInterestSchema);
