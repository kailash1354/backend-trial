import {
  ContentPageModel,
  ContentSectionModel,
  FaqModel,
  NavigationItemModel,
  PropertyModel,
  SeoPageModel,
  SiteSettingsModel,
  TestimonialModel,
} from "../models/content.model.js";

export const CmsRepository = {
  getSiteSettings: () => SiteSettingsModel.findOne({ isActive: true, deletedAt: null }).lean(),
  upsertSiteSettings: (payload: Record<string, unknown>) =>
    SiteSettingsModel.findOneAndUpdate({ isActive: true }, payload, { upsert: true, new: true }),

  listPages: () => ContentPageModel.find({ deletedAt: null }).sort({ routePath: 1 }).lean(),

  listNavigation: () => NavigationItemModel.find({ deletedAt: null }).sort({ sortOrder: 1 }).lean(),
  upsertNavigation: (payload: Record<string, unknown>) => {
    const id = (payload as { id?: string }).id;
    if (id) return NavigationItemModel.findByIdAndUpdate(id, payload, { new: true });
    return NavigationItemModel.create(payload);
  },
  deleteNavigation: (id: string) => NavigationItemModel.findByIdAndDelete(id),

  getPageByKey: (pageKey: string) => ContentPageModel.findOne({ pageKey, deletedAt: null }).lean(),
  listSectionsByPageKey: (pageKey: string) =>
    ContentSectionModel.find({ pageKey, deletedAt: null }).sort({ sortOrder: 1 }).lean(),
  upsertSection: (payload: Record<string, unknown>) =>
    ContentSectionModel.findOneAndUpdate(
      { pageKey: String(payload.pageKey), sectionKey: String(payload.sectionKey) },
      payload,
      { upsert: true, new: true },
    ),

  listTestimonials: () =>
    TestimonialModel.find({ isPublished: true, deletedAt: null }).sort({ sortOrder: 1 }).lean(),
  upsertTestimonial: (payload: Record<string, unknown>) => {
    const id = (payload as { id?: string }).id;
    if (id) return TestimonialModel.findByIdAndUpdate(id, payload, { new: true });
    return TestimonialModel.create(payload);
  },
  deleteTestimonial: (id: string) => TestimonialModel.findByIdAndDelete(id),

  listFaqs: () => FaqModel.find({ isPublished: true, deletedAt: null }).sort({ sortOrder: 1 }).lean(),
  listSeoPages: () => SeoPageModel.find({ deletedAt: null }).lean(),
  upsertSeoPage: (payload: Record<string, unknown>) =>
    SeoPageModel.findOneAndUpdate({ pageKey: String(payload.pageKey) }, payload, {
      upsert: true,
      new: true,
    }),
  listProperties: () => PropertyModel.find({ deletedAt: null }).lean(),
  upsertProperty: (payload: Record<string, unknown>) =>
    PropertyModel.findOneAndUpdate({ slug: String(payload.slug) }, payload, { upsert: true, new: true }),

  getPublicPageBundle: async (pageKey: string, routePath: string) => {
    const page =
      (await ContentPageModel.findOne({ pageKey, deletedAt: null }).lean()) ||
      (await ContentPageModel.findOne({ routePath, deletedAt: null }).lean());
    const sections = page
      ? await ContentSectionModel.find({ pageKey: page.pageKey, status: "published", deletedAt: null })
          .sort({ sortOrder: 1 })
          .lean()
      : [];
    const seo =
      (await SeoPageModel.findOne({ pageKey, deletedAt: null }).lean()) ||
      (await SeoPageModel.findOne({ pagePath: routePath, deletedAt: null }).lean());
    const [faqs, testimonials, siteSettings] = await Promise.all([
      FaqModel.find({ isPublished: true, deletedAt: null }).sort({ sortOrder: 1 }).lean(),
      TestimonialModel.find({ isPublished: true, deletedAt: null }).sort({ sortOrder: 1 }).lean(),
      SiteSettingsModel.findOne({ isActive: true, deletedAt: null }).lean(),
    ]);
    return { page, sections, seo, faqs, testimonials, siteSettings };
  },
};
