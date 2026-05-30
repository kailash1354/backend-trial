import { UserProfileModel } from "../models/user-profile.model.js";
import { SavedInterestModel } from "../models/saved-interest.model.js";
import { SiteVisitModel } from "../models/site-visit.model.js";
import { InvestmentUpdateModel } from "../models/investment-update.model.js";
import { UserDocumentModel } from "../models/user-document.model.js";
import { SupportThreadModel } from "../models/support-thread.model.js";
import { InquiryHistoryModel } from "../models/inquiry-history.model.js";

const LEGACY_PLACEHOLDER_NAMES = new Set(["Peter Parker"]);

function normalizeDisplayName(name: string) {
  const value = name.trim();
  if (!value) return "";
  if (LEGACY_PLACEHOLDER_NAMES.has(value)) return "";
  return value;
}

export const ProfileRepository = {
  findProfile: (userId: string) => UserProfileModel.findOne({ userId }),
  createProfile: (payload: Record<string, unknown>) => UserProfileModel.create(payload),
  updateProfile: (userId: string, payload: Record<string, unknown>) =>
    UserProfileModel.findOneAndUpdate({ userId }, payload, { new: true, upsert: true }),
  listInterests: (userId: string) => SavedInterestModel.find({ userId }).sort({ createdAt: -1 }),
  listSiteVisits: (userId: string) => SiteVisitModel.find({ userId }).sort({ visitAt: -1 }),
  listDocuments: (userId: string) => UserDocumentModel.find({ userId }).sort({ createdAt: -1 }),
  listSupportThreads: (userId: string) => SupportThreadModel.find({ userId }).sort({ lastActivityAt: -1 }),
  listInquiryHistory: (userId: string) =>
    InquiryHistoryModel.find({ userId }).sort({ loggedAt: -1 }),
  listUpdates: () => InvestmentUpdateModel.find().sort({ featured: -1, publishedAt: -1 }),
  seedProfileIfMissing: async (payload: {
    userId: string;
    email: string;
    fullName: string;
    roles: string[];
  }) => {
    const existing = await UserProfileModel.findOne({ userId: payload.userId });
    if (existing) return existing;
    return UserProfileModel.create({
      userId: payload.userId,
      email: payload.email,
      fullName: normalizeDisplayName(payload.fullName) || payload.email.split("@")[0] || "",
      profession: "",
      specialization: "",
      clinicType: "",
      organization: "",
      yearsOfPractice: 0,
      phone: "",
      preferredClinicSize: "",
      budgetRange: "",
      investmentIntent: "",
      city: "",
      relationshipManager: "",
      inquiryStatus: "",
      preferredUnitTypes: [],
      notes: "",
      profileImageUrl: "",
    });
  },
};
