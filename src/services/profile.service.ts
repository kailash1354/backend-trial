import { HttpError } from "../utils/http.js";
import { UserRepository } from "../repositories/user.repository.js";
import { ProfileRepository } from "../repositories/profile.repository.js";

const LEGACY_PLACEHOLDER_NAMES = new Set(["Peter Parker"]);

function normalizeDisplayName(name: string | null | undefined, fallback = "") {
  const value = (name ?? "").trim();
  if (!value) return fallback;
  if (LEGACY_PLACEHOLDER_NAMES.has(value)) return fallback;
  return value;
}

function toSummary(profile: Awaited<ReturnType<typeof ProfileRepository.findProfile>>, roles: string[]) {
  const emailFallback = profile?.email.split("@")[0]?.trim() || "";
  return {
    fullName: normalizeDisplayName(profile?.fullName, emailFallback),
    roles,
    profession: profile?.profession ?? "",
    specialization: profile?.specialization ?? "",
    clinicType: profile?.clinicType ?? "",
    organization: profile?.organization ?? "",
    yearsOfPractice: profile?.yearsOfPractice ?? 0,
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    preferredClinicSize: profile?.preferredClinicSize ?? "",
    budgetRange: profile?.budgetRange ?? "",
    investmentIntent: profile?.investmentIntent ?? "",
    city: profile?.city ?? "",
    relationshipManager: profile?.relationshipManager ?? "",
    inquiryStatus: profile?.inquiryStatus ?? "",
    preferredUnitTypes: profile?.preferredUnitTypes ?? [],
    notes: profile?.notes ?? "",
  };
}

function calculatePortalStats(profile: Awaited<ReturnType<typeof ProfileRepository.findProfile>>, payload: {
  interests: Array<{ isPinned?: boolean }>;
  siteVisits: Array<{ status: string }>;
  documents: unknown[];
  updates: unknown[];
  supportThreads: Array<{ status: string }>;
  inquiryHistory: unknown[];
}) {
  const completenessFields = profile
    ? [
        profile.fullName,
        profile.profession,
        profile.specialization,
        profile.clinicType,
        profile.organization,
        profile.yearsOfPractice > 0 ? profile.yearsOfPractice : "",
        profile.phone,
        profile.email,
        profile.preferredClinicSize,
        profile.budgetRange,
        profile.investmentIntent,
        profile.city,
        profile.relationshipManager,
        profile.inquiryStatus,
        profile.preferredUnitTypes.length > 0 ? profile.preferredUnitTypes.join(",") : "",
        profile.notes,
      ]
    : [];

  const filledFields = completenessFields.filter((field) => {
    if (typeof field === "number") return field > 0;
    if (typeof field === "string") return field.trim().length > 0;
    return Boolean(field);
  }).length;

  return {
    savedInterests: payload.interests.length,
    upcomingVisits: payload.siteVisits.filter((item) => item.status !== "Completed" && item.status !== "Cancelled").length,
    documents: payload.documents.length,
    updates: payload.updates.length,
    activeThreads: payload.supportThreads.filter((item) => item.status !== "Resolved").length,
    inquiryHistory: payload.inquiryHistory.length,
    profileCompleteness: profile && completenessFields.length > 0
      ? Math.round((filledFields / completenessFields.length) * 100)
      : 0,
  };
}

export const ProfileService = {
  async getDashboard(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const profile = await ProfileRepository.seedProfileIfMissing({
      userId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    });

    const [interests, siteVisits, documents, updates, supportThreads, inquiryHistory] = await Promise.all([
      ProfileRepository.listInterests(userId),
      ProfileRepository.listSiteVisits(userId),
      ProfileRepository.listDocuments(userId),
      ProfileRepository.listUpdates(),
      ProfileRepository.listSupportThreads(userId),
      ProfileRepository.listInquiryHistory(userId),
    ]);

    return {
      profile: toSummary(profile, user.roles),
      stats: calculatePortalStats(profile, {
        interests,
        siteVisits,
        documents,
        updates,
        supportThreads,
        inquiryHistory,
      }),
      interests,
      siteVisits,
      documents,
      updates,
      supportThreads,
      inquiryHistory,
    };
  },

  async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new HttpError(404, "User not found");
    const profile = await ProfileRepository.seedProfileIfMissing({
      userId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    });
    return toSummary(profile, user.roles);
  },

  async updateProfile(userId: string, payload: Record<string, unknown>) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new HttpError(404, "User not found");
    const next = await ProfileRepository.updateProfile(userId, {
      ...payload,
      userId,
      email: user.email,
      fullName: normalizeDisplayName(
        typeof payload.fullName === "string" ? payload.fullName : user.fullName,
        user.email.split("@")[0]?.trim() || "",
      ),
    });
    return toSummary(next, user.roles);
  },

  async getInterests(userId: string) {
    return ProfileRepository.listInterests(userId);
  },

  async toggleInterest(
    userId: string,
    payload: {
      category: string;
      title: string;
      subtitle?: string;
      description?: string;
      imageUrl?: string;
      href?: string;
      label?: string;
    },
  ) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    await ProfileRepository.seedProfileIfMissing({
      userId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    });

    const existing = await (await import("../models/saved-interest.model.js")).SavedInterestModel.findOne({
      userId,
      category: payload.category,
      title: payload.title,
    });

    if (existing) {
      await existing.deleteOne();
      return { removed: true };
    }

    const created = await (await import("../models/saved-interest.model.js")).SavedInterestModel.create({
      userId,
      category: payload.category,
      title: payload.title,
      subtitle: payload.subtitle ?? "",
      description: payload.description ?? "",
      imageUrl: payload.imageUrl ?? "",
      href: payload.href ?? "",
      label: payload.label ?? "",
      isPinned: false,
      metadata: {},
    });

    return { removed: false, interest: created };
  },

  async getSiteVisits(userId: string) {
    return ProfileRepository.listSiteVisits(userId);
  },

  async requestSiteVisit(userId: string, payload: { visitAt: string; notes?: string }) {
    const visit = await (await import("../models/site-visit.model.js")).SiteVisitModel.create({
      userId,
      visitAt: new Date(payload.visitAt),
      status: "Pending",
      representativeName: "",
      representativePhone: "",
      locationLabel: "Doctor House, JP Road, Andheri West",
      notes: payload.notes ?? "",
    });
    return visit;
  },

  async getDocuments(userId: string) {
    return ProfileRepository.listDocuments(userId);
  },

  async getUpdates(userId: string) {
    return ProfileRepository.listUpdates();
  },

  async getSupportThreads(userId: string) {
    return ProfileRepository.listSupportThreads(userId);
  },
};
