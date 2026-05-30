import { FormRepository } from "../repositories/form.repository.js";

export const FormService = {
  submit: (payload: Record<string, unknown>) => FormRepository.createSubmission(payload),
  listSubmissions: () => FormRepository.listSubmissions(),
  listForms: () => FormRepository.listForms(),
  upsertForm: (payload: Record<string, unknown>) => FormRepository.upsertForm(payload),
};
