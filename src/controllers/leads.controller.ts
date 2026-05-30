import type { Request, Response } from "express";
import { LeadService } from "../services/lead.service.js";
import { created, ok } from "../utils/http.js";

export const LeadsController = {
  async submit(req: Request, res: Response) {
    const data = await LeadService.submit(req.body);
    return created(res, { id: String(data._id) }, "lead submitted");
  },
  async list(_req: Request, res: Response) {
    const leads = await LeadService.list();
    return ok(res, { leads });
  },
  async updateStatus(req: Request, res: Response) {
    await LeadService.updateStatus(req.body.id as string, req.body.status as string);
    return ok(res, {}, "updated");
  },
  async remove(req: Request, res: Response) {
    await LeadService.remove(req.body.id as string);
    return ok(res, {}, "deleted");
  },
};
