import type { Request, Response } from "express";
import { CmsService } from "../services/cms.service.js";
import { ok } from "../utils/http.js";

export const CmsController = {
  async publicBundle(req: Request, res: Response) {
    const body = req.body as { pageKey: string; routePath: string };
    const data = await CmsService.getPublicBundle(body.pageKey, body.routePath);
    return ok(res, data);
  },
  async publicHomeDynamic(_req: Request, res: Response) {
    const data = await CmsService.getHomeDynamic();
    return ok(res, data);
  },
  async publicLocationDynamic(_req: Request, res: Response) {
    const data = await CmsService.getLocationDynamic();
    return ok(res, data);
  },
  async publicInvestmentDynamic(_req: Request, res: Response) {
    const data = await CmsService.getInvestmentDynamic();
    return ok(res, data);
  },
  async publicGalleryDynamic(_req: Request, res: Response) {
    const data = await CmsService.getGalleryDynamic();
    return ok(res, data);
  },
  async publicFloorPlansDynamic(_req: Request, res: Response) {
    const data = await CmsService.getFloorPlansDynamic();
    return ok(res, data);
  },
  async publicAmenitiesDynamic(_req: Request, res: Response) {
    const data = await CmsService.getAmenitiesDynamic();
    return ok(res, data);
  },
  async publicDeveloperDynamic(_req: Request, res: Response) {
    const data = await CmsService.getDeveloperDynamic();
    return ok(res, data);
  },
  async adminCollections(_req: Request, res: Response) {
    const data = await CmsService.getAdminCollections();
    return ok(res, data);
  },
  async upsertSiteSettings(req: Request, res: Response) {
    const data = await CmsService.upsertSiteSettings(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
  async upsertNavigation(req: Request, res: Response) {
    const data = await CmsService.upsertNavigation(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
  async deleteNavigation(req: Request, res: Response) {
    await CmsService.deleteNavigation(req.body.id as string, req.auth!.userId);
    return ok(res, {}, "deleted");
  },
  async upsertSection(req: Request, res: Response) {
    const data = await CmsService.upsertSection(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
  async upsertTestimonial(req: Request, res: Response) {
    const data = await CmsService.upsertTestimonial(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
  async deleteTestimonial(req: Request, res: Response) {
    await CmsService.deleteTestimonial(req.body.id as string, req.auth!.userId);
    return ok(res, {}, "deleted");
  },
  async upsertSeo(req: Request, res: Response) {
    const data = await CmsService.upsertSeoPage(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
  async upsertProperty(req: Request, res: Response) {
    const data = await CmsService.upsertProperty(req.body, req.auth!.userId);
    return ok(res, data, "saved");
  },
};
