import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const leadSchema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    profession: String,
    requirement: String,
    message: String,
    status: { type: String, default: "new", index: true },
  },
  baseSchemaOptions,
);

export const LeadModel = model("Lead", leadSchema);
