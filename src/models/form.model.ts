import { Schema, model } from "mongoose";
import { baseSchemaOptions, softDeleteFields } from "./base.js";

const formDefinitionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    schema: { type: Schema.Types.Mixed, required: true },
    destination: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeleteFields(formDefinitionSchema);

const formSubmissionSchema = new Schema(
  {
    formKey: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    source: String,
    ipAddress: String,
    userAgent: String,
  },
  baseSchemaOptions,
);

export const FormDefinitionModel = model("FormDefinition", formDefinitionSchema);
export const FormSubmissionModel = model("FormSubmission", formSubmissionSchema);
