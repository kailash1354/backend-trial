import { ActivityRepository } from "../repositories/activity.repository.js";
import { CmsRepository } from "../repositories/cms.repository.js";
import { MediaRepository } from "../repositories/media.repository.js";

function toLegacySettings(settings: any) {
  if (!settings) return null;
  return {
    id: String(settings._id),
    site_name: settings.siteName,
    site_tagline: settings.siteTagline,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    contact_address: settings.contactAddress,
    default_seo: settings.defaultSeo || {},
    feature_toggles: settings.featureToggles || {},
  };
}

function toLegacyNav(item: any) {
  return {
    id: String(item._id),
    menu_name: item.menuName,
    label: item.label,
    path: item.path,
    external_url: item.externalUrl,
    sort_order: item.sortOrder,
    is_visible: item.isVisible,
    open_in_new_tab: item.openInNewTab,
  };
}

function toLegacySection(section: any) {
  return {
    id: String(section._id),
    section_key: section.sectionKey,
    section_type: section.sectionType,
    sort_order: section.sortOrder,
    content: section.content,
    status: section.status,
    page_key: section.pageKey,
  };
}

export const CmsService = {
  async getPublicBundle(pageKey: string, routePath: string) {
    const data = await CmsRepository.getPublicPageBundle(pageKey, routePath);
    return {
      page: data.page
        ? {
            id: String((data.page as any)._id),
            page_key: (data.page as any).pageKey,
            route_path: (data.page as any).routePath,
            title: (data.page as any).title,
          }
        : null,
      sections: (data.sections as any[]).map(toLegacySection),
      seo: data.seo
        ? {
            page_key: (data.seo as any).pageKey,
            page_path: (data.seo as any).pagePath,
            title: (data.seo as any).title,
            description: (data.seo as any).description,
            og_title: (data.seo as any).ogTitle,
            og_description: (data.seo as any).ogDescription,
            og_image_url: (data.seo as any).ogImageUrl,
            twitter_title: (data.seo as any).twitterTitle,
            twitter_description: (data.seo as any).twitterDescription,
            twitter_image_url: (data.seo as any).twitterImageUrl,
            canonical_url: (data.seo as any).canonicalUrl,
            schema_json: (data.seo as any).schemaJson,
            indexable: (data.seo as any).indexable,
          }
        : null,
      faqs: data.faqs,
      testimonials: (data.testimonials as any[]).map((t) => ({
        id: String(t._id),
        author_name: t.authorName,
        author_role: t.authorRole,
        quote: t.quote,
        rating: t.rating,
      })),
      siteSettings: toLegacySettings(data.siteSettings),
    };
  },

  async getAdminCollections() {
    const [siteSettings, navigation, testimonials, seoPages, properties, faqs, activity, media, pages] =
      await Promise.all([
        CmsRepository.getSiteSettings(),
        CmsRepository.listNavigation(),
        CmsRepository.listTestimonials(),
        CmsRepository.listSeoPages(),
        CmsRepository.listProperties(),
        CmsRepository.listFaqs(),
        ActivityRepository.list(),
        MediaRepository.listAssets(),
        CmsRepository.listPages(),
      ]);

    const pageSections = await Promise.all(
      pages.map(async (p: any) => ({
        page_key: p.pageKey,
        route_path: p.routePath,
        sections: (await CmsRepository.listSectionsByPageKey(p.pageKey)).map(toLegacySection),
      })),
    );

    return {
      siteSettings: toLegacySettings(siteSettings),
      navigation: navigation.map(toLegacyNav),
      testimonials: testimonials.map((t: any) => ({
        id: String(t._id),
        author_name: t.authorName,
        author_role: t.authorRole,
        quote: t.quote,
        rating: t.rating,
        sort_order: t.sortOrder,
        is_published: t.isPublished,
      })),
      seoPages: seoPages.map((s: any) => ({
        id: String(s._id),
        page_key: s.pageKey,
        page_path: s.pagePath,
        title: s.title,
        description: s.description,
        indexable: s.indexable,
      })),
      properties: properties.map((p: any) => ({
        id: String(p._id),
        slug: p.slug,
        title: p.title,
        status: p.status,
        location: p.location,
        price_label: p.priceLabel,
        area_label: p.areaLabel,
      })),
      faqs,
      activity,
      pages: pages.map((p: any) => ({ page_key: p.pageKey, route_path: p.routePath, title: p.title })),
      pageSections,
      media: media.map((m: any) => ({
        id: String(m._id),
        public_url: m.publicUrl,
        storage_path: m.storagePath,
        alt_text: m.altText,
      })),
      homePage: {
        sections: pageSections.find((p) => p.page_key === "home")?.sections ?? [],
      },
    };
  },

  async getHomeDynamic() {
    const [sections, siteSettings] = await Promise.all([
      CmsRepository.listSectionsByPageKey("home"),
      CmsRepository.getSiteSettings(),
    ]);

    return {
      sections: (sections as any[])
        .filter((section) => section.status !== "draft")
        .map(toLegacySection),
      siteSettings: toLegacySettings(siteSettings),
    };
  },
  async getLocationDynamic() {
    const bundle = await CmsService.getPublicBundle("location", "/location");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const timelineSection = bundle.sections.find((section: any) => section.section_type === "timeline")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      imageLabel: heroSection.imageLabel,
      imageTitle: heroSection.imageTitle,
      imageAlt: heroSection.imageAlt,
      timeline: timelineSection.items,
    };

    return { model, seo: bundle.seo };
  },
  async getInvestmentDynamic() {
    const bundle = await CmsService.getPublicBundle("investment", "/investment");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const cardsSection = bundle.sections.find((section: any) => section.section_type === "cards")?.content ?? {};
    const ctaSection = bundle.sections.find((section: any) => section.section_type === "cta")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      visualEyebrow: heroSection.visualEyebrow,
      visualTitle: heroSection.visualTitle,
      visualAlt: heroSection.visualAlt,
      cards: cardsSection.items,
      ctaLabel: ctaSection.ctaLabel,
      ctaPath: ctaSection.ctaPath,
    };

    return { model, seo: bundle.seo };
  },
  async getGalleryDynamic() {
    const bundle = await CmsService.getPublicBundle("gallery", "/gallery");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const gallerySection = bundle.sections.find((section: any) => section.section_type === "gallery")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      items: gallerySection.items,
    };

    return { model, seo: bundle.seo };
  },
  async getFloorPlansDynamic() {
    const bundle = await CmsService.getPublicBundle("floor-plans", "/floor-plans");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const plansSection = bundle.sections.find((section: any) => section.section_type === "plans")?.content ?? {};
    const ctaSection = bundle.sections.find((section: any) => section.section_type === "cta")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      plans: plansSection.items,
      ctaEyebrow: ctaSection.eyebrow,
      ctaTitle: ctaSection.title,
      ctaDescription: ctaSection.description,
      ctaLabel: ctaSection.ctaLabel,
      ctaPath: ctaSection.ctaPath,
      rowCtaLabel: plansSection.rowCtaLabel,
      rowCtaPath: plansSection.rowCtaPath,
    };

    return { model, seo: bundle.seo };
  },
  async getAmenitiesDynamic() {
    const bundle = await CmsService.getPublicBundle("amenities", "/amenities");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const amenitiesSection = bundle.sections.find((section: any) => section.section_type === "amenities")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      items: amenitiesSection.items,
    };

    return { model, seo: bundle.seo };
  },
  async getDeveloperDynamic() {
    const bundle = await CmsService.getPublicBundle("developer", "/developer");
    const heroSection = bundle.sections.find((section: any) => section.section_type === "hero")?.content ?? {};
    const pillarsSection = bundle.sections.find((section: any) => section.section_type === "pillars")?.content ?? {};
    const brandSection = bundle.sections.find((section: any) => section.section_type === "brand")?.content ?? {};

    const model = {
      eyebrow: heroSection.eyebrow,
      title: heroSection.title,
      description: heroSection.description,
      pillars: pillarsSection.items,
      brandTitle: brandSection.title,
      brandSubtitle: brandSection.subtitle,
      brandDescription: brandSection.description,
      ctaLabel: brandSection.ctaLabel,
      ctaPath: brandSection.ctaPath,
    };

    return { model, seo: bundle.seo };
  },

  async upsertSiteSettings(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      siteName: payload.site_name,
      siteTagline: payload.site_tagline,
      contactEmail: payload.contact_email,
      contactPhone: payload.contact_phone,
      contactAddress: payload.contact_address,
      defaultSeo: payload.default_seo,
      featureToggles: payload.feature_toggles,
      isActive: true,
    };
    const data = await CmsRepository.upsertSiteSettings(mapped);
    await ActivityRepository.create({
      actorUserId,
      action: "upsert",
      entity: "siteSettings",
      afterData: payload,
    });
    return data;
  },

  async upsertNavigation(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      id: payload.id,
      menuName: payload.menu_name,
      label: payload.label,
      path: payload.path,
      externalUrl: payload.external_url,
      sortOrder: payload.sort_order,
      isVisible: payload.is_visible,
      openInNewTab: payload.open_in_new_tab,
    };
    const data = await CmsRepository.upsertNavigation(mapped);
    await ActivityRepository.create({ actorUserId, action: "upsert", entity: "navigation", afterData: payload });
    return data;
  },

  async deleteNavigation(id: string, actorUserId: string) {
    await CmsRepository.deleteNavigation(id);
    await ActivityRepository.create({ actorUserId, action: "delete", entity: "navigation", entityId: id });
  },

  async upsertSection(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      pageKey: payload.page_key || "home",
      sectionKey: payload.section_key,
      sectionType: payload.section_type,
      sortOrder: payload.sort_order,
      content: payload.content,
      status: payload.status,
    };
    const data = await CmsRepository.upsertSection(mapped);
    await ActivityRepository.create({ actorUserId, action: "upsert", entity: "contentSection", afterData: payload });
    return data;
  },

  async upsertTestimonial(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      id: payload.id,
      authorName: payload.author_name,
      authorRole: payload.author_role,
      quote: payload.quote,
      rating: payload.rating,
      sortOrder: payload.sort_order,
      isPublished: payload.is_published,
    };
    const data = await CmsRepository.upsertTestimonial(mapped);
    await ActivityRepository.create({ actorUserId, action: "upsert", entity: "testimonial", afterData: payload });
    return data;
  },

  async deleteTestimonial(id: string, actorUserId: string) {
    await CmsRepository.deleteTestimonial(id);
    await ActivityRepository.create({ actorUserId, action: "delete", entity: "testimonial", entityId: id });
  },

  async upsertSeoPage(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      pageKey: payload.page_key,
      pagePath: payload.page_path,
      title: payload.title,
      description: payload.description,
      ogTitle: payload.og_title,
      ogDescription: payload.og_description,
      ogImageUrl: payload.og_image_url,
      twitterTitle: payload.twitter_title,
      twitterDescription: payload.twitter_description,
      twitterImageUrl: payload.twitter_image_url,
      canonicalUrl: payload.canonical_url,
      schemaJson: payload.schema_json,
      indexable: payload.indexable,
    };
    const data = await CmsRepository.upsertSeoPage(mapped);
    await ActivityRepository.create({ actorUserId, action: "upsert", entity: "seoPage", afterData: payload });
    return data;
  },

  async upsertProperty(payload: Record<string, unknown>, actorUserId: string) {
    const mapped = {
      slug: payload.slug,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      location: payload.location,
      priceLabel: payload.price_label,
      areaLabel: payload.area_label,
      features: payload.features || [],
      amenities: payload.amenities || [],
      floorPlans: payload.floor_plans || [],
      gallery: payload.gallery || [],
      isPublished: payload.is_published,
    };
    const data = await CmsRepository.upsertProperty(mapped);
    await ActivityRepository.create({ actorUserId, action: "upsert", entity: "property", afterData: payload });
    return data;
  },
};
