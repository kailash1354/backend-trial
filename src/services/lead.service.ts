import { LeadRepository } from "../repositories/lead.repository.js";

export const LeadService = {
  submit: (payload: {
    full_name: string;
    mobile: string;
    email: string;
    profession?: string;
    requirement?: string;
    message?: string;
  }) =>
    LeadRepository.create({
      fullName: payload.full_name,
      mobile: payload.mobile,
      email: payload.email,
      profession: payload.profession,
      requirement: payload.requirement,
      message: payload.message,
      status: "new",
    }),

  list: async () => {
    const leads = await LeadRepository.list();
    return leads.map((l: any) => ({
      id: String(l._id),
      full_name: l.fullName,
      mobile: l.mobile,
      email: l.email,
      profession: l.profession || null,
      requirement: l.requirement || null,
      message: l.message || null,
      status: l.status,
      created_at: l.createdAt,
    }));
  },

  updateStatus: (id: string, status: string) => LeadRepository.updateStatus(id, status),
  remove: (id: string) => LeadRepository.remove(id),
};
