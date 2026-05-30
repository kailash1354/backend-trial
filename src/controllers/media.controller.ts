import type { Request, Response } from "express";
import { MediaService } from "../services/media.service.js";
import { ok } from "../utils/http.js";

export const MediaController = {
  async list(_req: Request, res: Response) {
    const data = await MediaService.listAssets();
    return ok(res, data);
  },
  async upload(req: Request, res: Response) {
    if (!req.file) throw new Error("No file uploaded");
    const data = await MediaService.registerUpload(req.file);
    return ok(res, data, "uploaded");
  },
};
