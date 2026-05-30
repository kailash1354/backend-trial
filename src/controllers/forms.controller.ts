import type { Request, Response } from "express";
import { FormService } from "../services/form.service.js";
import { created, ok } from "../utils/http.js";

export const FormsController = {
  async submit(req: Request, res: Response) {
    const data = await FormService.submit(req.body);
    return created(res, data, "submitted");
  },
  async listSubmissions(_req: Request, res: Response) {
    const data = await FormService.listSubmissions();
    return ok(res, data);
  },
  async listForms(_req: Request, res: Response) {
    const data = await FormService.listForms();
    return ok(res, data);
  },
  async upsertForm(req: Request, res: Response) {
    const data = await FormService.upsertForm(req.body);
    return ok(res, data, "saved");
  },
};
