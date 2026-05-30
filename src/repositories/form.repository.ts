import { FormDefinitionModel, FormSubmissionModel } from "../models/form.model.js";

export const FormRepository = {
  listForms: () => FormDefinitionModel.find({ deletedAt: null }).lean(),
  upsertForm: (payload: Record<string, unknown>) =>
    FormDefinitionModel.findOneAndUpdate({ key: String(payload.key) }, payload, { upsert: true, new: true }),
  createSubmission: (payload: Record<string, unknown>) => FormSubmissionModel.create(payload),
  listSubmissions: () => FormSubmissionModel.find({}).sort({ createdAt: -1 }).lean(),
};
