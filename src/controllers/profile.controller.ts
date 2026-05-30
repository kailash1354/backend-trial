import type { Request, Response } from "express";
import { ProfileService } from "../services/profile.service.js";
import { created, ok } from "../utils/http.js";

export const ProfileController = {
  async dashboard(req: Request, res: Response) {
    const data = await ProfileService.getDashboard(req.auth!.userId);
    return ok(res, data, "profile dashboard");
  },

  async me(req: Request, res: Response) {
    const profile = await ProfileService.getProfile(req.auth!.userId);
    return ok(res, profile, "profile details");
  },

  async update(req: Request, res: Response) {
    const profile = await ProfileService.updateProfile(req.auth!.userId, req.body);
    return ok(res, profile, "profile updated");
  },

  async interests(req: Request, res: Response) {
    const interests = await ProfileService.getInterests(req.auth!.userId);
    return ok(res, { interests }, "saved interests");
  },

  async toggleInterest(req: Request, res: Response) {
    const result = await ProfileService.toggleInterest(req.auth!.userId, req.body);
    return ok(res, result, result.removed ? "interest removed" : "interest saved");
  },

  async siteVisits(req: Request, res: Response) {
    const siteVisits = await ProfileService.getSiteVisits(req.auth!.userId);
    return ok(res, { siteVisits }, "site visits");
  },

  async requestSiteVisit(req: Request, res: Response) {
    const visit = await ProfileService.requestSiteVisit(req.auth!.userId, req.body);
    return created(res, visit, "site visit requested");
  },

  async documents(req: Request, res: Response) {
    const documents = await ProfileService.getDocuments(req.auth!.userId);
    return ok(res, { documents }, "documents");
  },

  async updates(req: Request, res: Response) {
    const updates = await ProfileService.getUpdates(req.auth!.userId);
    return ok(res, { updates }, "investment updates");
  },

  async support(req: Request, res: Response) {
    const supportThreads = await ProfileService.getSupportThreads(req.auth!.userId);
    return ok(res, { supportThreads }, "support threads");
  },
};
