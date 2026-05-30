import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const siteVisitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestedAt: { type: Date, default: () => new Date(), index: true },
    visitAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    representativeName: { type: String, default: "" },
    representativePhone: { type: String, default: "" },
    locationLabel: { type: String, default: "Doctor House, JP Road, Andheri West" },
    notes: { type: String, default: "" },
  },
  baseSchemaOptions,
);

export const SiteVisitModel = model("SiteVisit", siteVisitSchema);
