import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const supportMessageSchema = new Schema(
  {
    sender: { type: String, enum: ["user", "team"], required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const supportThreadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["Open", "In progress", "Resolved"], default: "Open", index: true },
    assignedTo: { type: String, default: "" },
    assignedEmail: { type: String, default: "" },
    messages: { type: [supportMessageSchema], default: [] },
    lastActivityAt: { type: Date, default: () => new Date(), index: true },
  },
  baseSchemaOptions,
);

export const SupportThreadModel = model("SupportThread", supportThreadSchema);
