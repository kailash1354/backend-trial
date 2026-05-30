import { connectDb } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import {
  ContentPageModel,
  ContentSectionModel,
  NavigationItemModel,
  SeoPageModel,
  SiteSettingsModel,
  TestimonialModel,
} from "../src/models/content.model.js";

const pages = [
  ["home", "/", "Doctor House Home"],
  ["about", "/about", "About Doctor House"],
  ["location", "/location", "Location"],
  ["investment", "/investment", "Investment"],
  ["contact", "/contact", "Contact"],
  ["gallery", "/gallery", "Gallery"],
  ["amenities", "/amenities", "Amenities"],
  ["floor-plans", "/floor-plans", "Floor Plans"],
  ["developer", "/developer", "Developer"],
  ["investor-relations", "/investor-relations", "Investor Relations"],
] as const;

async function seed() {
  await connectDb();

  await SiteSettingsModel.findOneAndUpdate(
    { isActive: true },
    {
      siteName: "Doctor House",
      siteTagline: "Built for those who heal",
      contactEmail: "jakkdeveloper@gmail.com",
      contactPhone: "+91 81049 37601",
      contactAddress: "JP Road, Andheri West, Mumbai, Maharashtra, India",
      isActive: true,
    },
    { upsert: true, new: true },
  );

  await NavigationItemModel.deleteMany({});
  await NavigationItemModel.insertMany([
    {
      menuName: "header",
      label: "Home",
      path: "/",
      sortOrder: 1,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Project",
      path: "/about",
      sortOrder: 2,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Location",
      path: "/location",
      sortOrder: 3,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Investment",
      path: "/investment",
      sortOrder: 4,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Gallery",
      path: "/gallery",
      sortOrder: 5,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Floor Plans",
      path: "/floor-plans",
      sortOrder: 6,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Amenities",
      path: "/amenities",
      sortOrder: 7,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Developer",
      path: "/developer",
      sortOrder: 8,
      isVisible: true,
    },
    {
      menuName: "header",
      label: "Enquire",
      path: "/contact",
      sortOrder: 9,
      isVisible: true,
    },
    {
      menuName: "footer_explore",
      label: "About Project",
      path: "/about",
      sortOrder: 1,
      isVisible: true,
    },
    {
      menuName: "footer_explore",
      label: "Location",
      path: "/location",
      sortOrder: 2,
      isVisible: true,
    },
    {
      menuName: "footer_explore",
      label: "Investment",
      path: "/investment",
      sortOrder: 3,
      isVisible: true,
    },
    {
      menuName: "footer_explore",
      label: "Gallery",
      path: "/gallery",
      sortOrder: 4,
      isVisible: true,
    },
    {
      menuName: "footer_explore",
      label: "Amenities",
      path: "/amenities",
      sortOrder: 5,
      isVisible: true,
    },
    {
      menuName: "footer_company",
      label: "Developer",
      path: "/developer",
      sortOrder: 1,
      isVisible: true,
    },
    {
      menuName: "footer_company",
      label: "Investors",
      path: "/investor-relations",
      sortOrder: 2,
      isVisible: true,
    },
    {
      menuName: "footer_company",
      label: "Privacy",
      path: "/privacy",
      sortOrder: 3,
      isVisible: true,
    },
    {
      menuName: "footer_company",
      label: "Terms",
      path: "/terms",
      sortOrder: 4,
      isVisible: true,
    },
  ]);

  for (const [pageKey, routePath, title] of pages) {
    await ContentPageModel.findOneAndUpdate(
      { pageKey },
      { pageKey, routePath, title, layout: "default", status: "published" },
      { upsert: true, new: true },
    );
    await SeoPageModel.findOneAndUpdate(
      { pageKey },
      {
        pageKey,
        pagePath: routePath,
        title: `${title} — Doctor House`,
        description: `${title} content for Doctor House, JP Road Andheri West.`,
        canonicalUrl: `${env.APP_URL.replace(/\/+$/, "")}${routePath}`,
        indexable: true,
      },
      { upsert: true, new: true },
    );
  }

  const upsertSection = async (
    pageKey: string,
    sectionKey: string,
    sectionType: string,
    sortOrder: number,
    content: Record<string, unknown>,
  ) => {
    await ContentSectionModel.findOneAndUpdate(
      { pageKey, sectionKey },
      {
        pageKey,
        sectionKey,
        sectionType,
        sortOrder,
        content,
        status: "published",
      },
      { upsert: true, new: true },
    );
  };

  await upsertSection("home", "hero", "home_hero", 1, {
    eyebrow: "JAKK Projects & Developer · Andheri West",
    title: "Exclusive Medical Spaces in the Heart of Andheri West",
    subtitle:
      "Luxury commercial infrastructure designed exclusively for doctors, consultants, clinics, and healthcare professionals.",
    backgroundKey: "hero_night",
    primaryCtaLabel: "Explore Project",
    primaryCtaPath: "/about",
    secondaryCtaLabel: "Schedule Site Visit",
    secondaryCtaPath: "/contact",
  });

  await upsertSection("home", "about_split", "home_split", 2, {
    eyebrow: "The Project",
    title: "A landmark built for the next era of healthcare.",
    description:
      "Doctor House is a thoughtfully designed medical-commercial development on Mumbai's most connected healthcare corridor. Every floor, façade, and detail is engineered for modern medicine.",
    imageKey: "building_day",
    stats: [
      { value: "20+", label: "Premium Units" },
      { value: "12", label: "Floors" },
      { value: "100%", label: "Medical Focused" },
      { value: "JP Road", label: "Prime Frontage" },
    ],
  });

  await upsertSection("home", "highlights", "cards", 3, {
    eyebrow: "Highlights",
    title: "Every detail. Engineered for excellence.",
    items: [
      {
        title: "Nursing Home Approved",
        description: "Full regulatory clearance for medical practice.",
      },
      {
        title: "Prime JP Road Address",
        description: "The most recognised healthcare corridor in Andheri.",
      },
      {
        title: "Modern Glass Façade",
        description: "Refined architectural identity built to last.",
      },
      {
        title: "Medical Ecosystem",
        description: "A vertical community of specialists and clinics.",
      },
      {
        title: "Excellent Connectivity",
        description: "Minutes from Metro, station, airport, and hospitals.",
      },
      {
        title: "Premium Investment",
        description: "Long-term appreciation in a high-demand zone.",
      },
    ],
  });

  await upsertSection("home", "location_timeline", "timeline", 4, {
    eyebrow: "Location",
    title: "The most connected address in Andheri West.",
    items: [
      {
        title: "Andheri Railway Station",
        time: "5 min",
        description: "Western line access for patients across the city.",
      },
      {
        title: "Andheri Metro Station",
        time: "5 min",
        description: "Line 1 connectivity to Versova and Ghatkopar.",
      },
      {
        title: "Azad Nagar Metro",
        time: "7 min",
        description: "Direct corridor through Andheri West.",
      },
      {
        title: "Kokilaben Hospital",
        time: "10 min",
        description: "Proximity to leading healthcare ecosystems.",
      },
    ],
  });

  await upsertSection("home", "investment_metrics", "stats", 5, {
    eyebrow: "Investment Value",
    title: "Not just a space. A long-term asset.",
    items: [
      { value: "Strong", label: "Patient Catchment" },
      { value: "Premium", label: "Brand Positioning" },
      { value: "Long-term", label: "Appreciation" },
      { value: "Elevated", label: "Professional Identity" },
    ],
  });

  await upsertSection("home", "gallery_featured", "gallery", 6, {
    eyebrow: "Gallery",
    title: "A closer look at Doctor House.",
    items: [
      {
        imageKey: "hero_night",
        label: "Night Elevation",
        category: "Exterior",
      },
      { imageKey: "building_day", label: "Day View", category: "Exterior" },
      { imageKey: "entrance", label: "Lobby", category: "Interior" },
      {
        imageKey: "investment",
        label: "Detail Study",
        category: "Materiality",
      },
      { imageKey: "location", label: "Context", category: "Urban" },
    ],
  });

  await upsertSection("home", "why_choose", "cards", 7, {
    eyebrow: "Why Doctor House",
    title: "The clearest decision you'll make this year.",
    items: [
      {
        title: "Exclusive healthcare ecosystem",
        description: "Built only for healthcare professionals.",
      },
      {
        title: "Strategic Andheri West location",
        description: "High patient density and premium visibility.",
      },
      {
        title: "Premium identity",
        description: "Elevates brand and patient confidence.",
      },
      {
        title: "Strong appreciation profile",
        description: "A resilient medical-commercial asset class.",
      },
    ],
  });

  await upsertSection("home", "developer_cta", "cta", 8, {
    title: "A developer that builds for a single standard. The highest.",
    description:
      "JAKK Projects delivers architecturally distinct, infrastructure-grade projects with uncompromising quality.",
    ctaLabel: "About the Developer",
    ctaPath: "/developer",
  });

  await upsertSection("home", "enquiry", "contact", 9, {
    phoneLabel: "+91 81049 37601",
    phone: "+918104937601",
    email: "jakkdeveloper@gmail.com",
    address: "JP Road, Andheri West, Mumbai, Maharashtra, India",
  });

  const commonPages = [
    "about",
    "location",
    "investment",
    "gallery",
    "amenities",
    "floor-plans",
    "developer",
    "investor-relations",
  ];
  for (const key of commonPages) {
    await upsertSection(key, "intro", "text", 1, {
      eyebrow: key.replace(/-/g, " ").toUpperCase(),
      title: `${key.replace(/-/g, " ")} — Doctor House`,
      description: "Managed content section. Editable from admin CMS.",
    });
    await upsertSection(key, "blocks", "cards", 2, {
      items: [
        {
          title: "Premium Positioning",
          description: "Optimized for medical-commercial excellence.",
        },
        {
          title: "CMS Managed",
          description: "Fully editable from the admin operating panel.",
        },
      ],
    });
    await upsertSection(key, "cta", "cta", 3, {
      title: "Need the complete project dossier?",
      description:
        "Request pricing, plans, and walkthrough details from our team.",
      ctaLabel: "Contact Team",
      ctaPath: "/contact",
    });
  }

  await upsertSection("contact", "contact_form", "contact", 2, {
    phoneLabel: "+91 81049 37601",
    phone: "+918104937601",
    email: "jakkdeveloper@gmail.com",
    address: "JP Road, Andheri West, Mumbai, Maharashtra, India",
  });

  await TestimonialModel.deleteMany({});
  await TestimonialModel.insertMany([
    {
      authorName: "Dr. Mehra",
      authorRole: "Cardiologist",
      quote:
        "Doctor House provides the right environment for premium patient confidence and clinical operations.",
      rating: 5,
      sortOrder: 1,
      isPublished: true,
    },
    {
      authorName: "Dr. Sinha",
      authorRole: "Orthopedic Surgeon",
      quote:
        "Location and infrastructure quality are exactly what modern practices need.",
      rating: 5,
      sortOrder: 2,
      isPublished: true,
    },
  ]);

  console.log("CMS seed complete");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
