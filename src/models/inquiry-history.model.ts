import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const inquiryHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, default: "Website enquiry", index: true },
    subject: { type: String, required: true },
    detail: { type: String, default: "" },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Visit Scheduled", "Negotiation", "Booked", "Closed"],
      default: "New",
    },
    loggedAt: { type: Date, default: () => new Date(), index: true },
  },
  baseSchemaOptions,
);

export const InquiryHistoryModel = model("InquiryHistory", inquiryHistorySchema);
