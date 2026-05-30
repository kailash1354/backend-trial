import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const userDocumentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["Brochure", "Floor Plan", "Investment Deck", "Application", "Approval", "Payment"],
      default: "Brochure",
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "application/pdf" },
    secure: { type: Boolean, default: true },
    sizeLabel: { type: String, default: "" },
  },
  baseSchemaOptions,
);

export const UserDocumentModel = model("UserDocument", userDocumentSchema);
