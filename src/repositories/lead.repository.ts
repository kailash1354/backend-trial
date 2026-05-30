import { LeadModel } from "../models/lead.model.js";

export const LeadRepository = {
  create: (payload: Record<string, unknown>) => LeadModel.create(payload),
  list: () => LeadModel.find({}).sort({ createdAt: -1 }).lean(),
  updateStatus: (id: string, status: string) => LeadModel.findByIdAndUpdate(id, { status }, { new: true }),
  remove: (id: string) => LeadModel.findByIdAndDelete(id),
};
