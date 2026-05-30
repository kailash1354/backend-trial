import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const investmentUpdateSchema = new Schema(
  {
    audience: { type: String, enum: ["all", "user"], default: "all", index: true },
    category: { type: String, default: "Project update", index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    detail: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: () => new Date(), index: true },
    emphasis: { type: String, default: "Premium medical commercial positioning" },
  },
  baseSchemaOptions,
);

export const InvestmentUpdateModel = model("InvestmentUpdate", investmentUpdateSchema);
