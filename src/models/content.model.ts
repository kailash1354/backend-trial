import { Schema, model } from "mongoose";
import { baseSchemaOptions, softDeleteFields } from "./base.js";

const siteSettingsSchema = new Schema(
  {
    siteName: { type: String, required: true },
    siteTagline: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    contactAddress: { type: String },
    defaultSeo: { type: Schema.Types.Mixed, default: {} },
    featureToggles: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeleteFields(siteSettingsSchema);

const seoPageSchema = new Schema(
  {
    pageKey: { type: String, required: true, unique: true },
    pagePath: { type: String, required: true, index: true },
    title: String,
    description: String,
    ogTitle: String,
    ogDescription: String,
    ogImageUrl: String,
    twitterTitle: String,
    twitterDescription: String,
    twitterImageUrl: String,
    canonicalUrl: String,
    schemaJson: { type: Schema.Types.Mixed, default: {} },
    indexable: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeleteFields(seoPageSchema);

const contentPageSchema = new Schema(
  {
    pageKey: { type: String, required: true, unique: true },
    routePath: { type: String, required: true, index: true },
    title: String,
    layout: { type: String, default: "default" },
    status: { type: String, default: "published", index: true },
  },
  baseSchemaOptions,
);
softDeleteFields(contentPageSchema);

const contentSectionSchema = new Schema(
  {
    pageKey: { type: String, required: true, index: true },
    sectionKey: { type: String, required: true },
    sectionType: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    content: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: "published" },
  },
  baseSchemaOptions,
);
contentSectionSchema.index({ pageKey: 1, sectionKey: 1 }, { unique: true });
softDeleteFields(contentSectionSchema);

const testimonialSchema = new Schema(
  {
    authorName: { type: String, required: true },
    authorRole: String,
    quote: { type: String, required: true },
    rating: Number,
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeleteFields(testimonialSchema);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    pageKeys: { type: [String], default: [] },
  },
  baseSchemaOptions,
);
softDeleteFields(faqSchema);

const navigationItemSchema = new Schema(
  {
    menuName: { type: String, required: true, index: true },
    label: { type: String, required: true },
    path: String,
    externalUrl: String,
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    openInNewTab: { type: Boolean, default: false },
  },
  baseSchemaOptions,
);
softDeleteFields(navigationItemSchema);

const propertySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    category: String,
    status: { type: String, default: "active" },
    location: String,
    priceLabel: String,
    areaLabel: String,
    features: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    floorPlans: { type: [Schema.Types.Mixed], default: [] },
    primaryImageUrl: String,
    gallery: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);
softDeleteFields(propertySchema);

export const SiteSettingsModel = model("SiteSettings", siteSettingsSchema);
export const SeoPageModel = model("SeoPage", seoPageSchema);
export const ContentPageModel = model("ContentPage", contentPageSchema);
export const ContentSectionModel = model("ContentSection", contentSectionSchema);
export const TestimonialModel = model("Testimonial", testimonialSchema);
export const FaqModel = model("Faq", faqSchema);
export const NavigationItemModel = model("NavigationItem", navigationItemSchema);
export const PropertyModel = model("Property", propertySchema);
