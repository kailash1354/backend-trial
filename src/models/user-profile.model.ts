import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const userProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    profession: { type: String, default: "" },
    specialization: { type: String, default: "" },
    clinicType: { type: String, default: "" },
    organization: { type: String, default: "" },
    yearsOfPractice: { type: Number, default: 0 },
    phone: { type: String, default: "" },
    email: { type: String, required: true, index: true },
    preferredClinicSize: { type: String, default: "" },
    budgetRange: { type: String, default: "" },
    investmentIntent: { type: String, default: "" },
    city: { type: String, default: "" },
    relationshipManager: { type: String, default: "" },
    inquiryStatus: { type: String, default: "" },
    preferredUnitTypes: { type: [String], default: [] },
    profileImageUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  baseSchemaOptions,
);

export const UserProfileModel = model("UserProfile", userProfileSchema);
