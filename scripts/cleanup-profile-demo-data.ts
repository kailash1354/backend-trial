import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { UserProfileModel } from "../src/models/user-profile.model.js";
import { SavedInterestModel } from "../src/models/saved-interest.model.js";
import { SiteVisitModel } from "../src/models/site-visit.model.js";
import { UserDocumentModel } from "../src/models/user-document.model.js";
import { SupportThreadModel } from "../src/models/support-thread.model.js";
import { InquiryHistoryModel } from "../src/models/inquiry-history.model.js";
import { InvestmentUpdateModel } from "../src/models/investment-update.model.js";

type LegacyProfile = {
  userId: mongoose.Types.ObjectId;
};

const LEGACY_PROFILE_SIGNATURE = {
  profession: "Doctor",
  specialization: "Medical Practice",
  clinicType: "Consultation Clinic",
  preferredClinicSize: "450-650 sq.ft.",
  budgetRange: "On request",
  investmentIntent: "Owner-occupied",
  city: "Mumbai",
  relationshipManager: "Project Relations Team",
  inquiryStatus: "Active interest",
  preferredUnitTypes: ["Consultation Suite", "Specialist Clinic"],
};

function isLegacyProfile(profile: Record<string, unknown>) {
  const unitTypes = Array.isArray(profile.preferredUnitTypes) ? profile.preferredUnitTypes : [];
  const sameUnits =
    unitTypes.length === LEGACY_PROFILE_SIGNATURE.preferredUnitTypes.length &&
    unitTypes.every((unit, index) => unit === LEGACY_PROFILE_SIGNATURE.preferredUnitTypes[index]);

  return (
    profile.profession === LEGACY_PROFILE_SIGNATURE.profession &&
    profile.specialization === LEGACY_PROFILE_SIGNATURE.specialization &&
    profile.clinicType === LEGACY_PROFILE_SIGNATURE.clinicType &&
    profile.preferredClinicSize === LEGACY_PROFILE_SIGNATURE.preferredClinicSize &&
    profile.budgetRange === LEGACY_PROFILE_SIGNATURE.budgetRange &&
    profile.investmentIntent === LEGACY_PROFILE_SIGNATURE.investmentIntent &&
    profile.city === LEGACY_PROFILE_SIGNATURE.city &&
    profile.relationshipManager === LEGACY_PROFILE_SIGNATURE.relationshipManager &&
    profile.inquiryStatus === LEGACY_PROFILE_SIGNATURE.inquiryStatus &&
    sameUnits
  );
}

async function cleanupDemoProfile(userId: mongoose.Types.ObjectId) {
  const [interestsResult, visitsResult, documentsResult, supportResult, inquiryResult, profileResult] =
    await Promise.all([
      SavedInterestModel.deleteMany({ userId }),
      SiteVisitModel.deleteMany({ userId }),
      UserDocumentModel.deleteMany({ userId }),
      SupportThreadModel.deleteMany({ userId }),
      InquiryHistoryModel.deleteMany({ userId }),
      UserProfileModel.deleteOne({ userId }),
    ]);

  console.log(
    [
      `Removed demo profile for user ${userId.toString()}`,
      `savedInterests=${interestsResult.deletedCount ?? 0}`,
      `siteVisits=${visitsResult.deletedCount ?? 0}`,
      `documents=${documentsResult.deletedCount ?? 0}`,
      `supportThreads=${supportResult.deletedCount ?? 0}`,
      `inquiryHistory=${inquiryResult.deletedCount ?? 0}`,
      `profile=${profileResult.deletedCount ?? 0}`,
    ].join(" | "),
  );
}

async function cleanupLegacyUpdates() {
  const titles = [
    "Inventory access has opened for preferred healthcare professionals.",
    "Premium facade and lobby detailing remain on schedule.",
  ];

  const result = await InvestmentUpdateModel.deleteMany({
    title: { $in: titles },
  });

  if ((result.deletedCount ?? 0) > 0) {
    console.log(`Removed legacy investment updates: ${result.deletedCount}`);
  }
}

async function main() {
  await connectDb();

  const legacyProfiles = (await UserProfileModel.find({
    profession: LEGACY_PROFILE_SIGNATURE.profession,
    specialization: LEGACY_PROFILE_SIGNATURE.specialization,
    clinicType: LEGACY_PROFILE_SIGNATURE.clinicType,
    preferredClinicSize: LEGACY_PROFILE_SIGNATURE.preferredClinicSize,
    budgetRange: LEGACY_PROFILE_SIGNATURE.budgetRange,
    investmentIntent: LEGACY_PROFILE_SIGNATURE.investmentIntent,
    city: LEGACY_PROFILE_SIGNATURE.city,
    relationshipManager: LEGACY_PROFILE_SIGNATURE.relationshipManager,
    inquiryStatus: LEGACY_PROFILE_SIGNATURE.inquiryStatus,
  }).lean()) as LegacyProfile[];

  if (legacyProfiles.length === 0) {
    console.log("No legacy demo profile records found.");
    await mongoose.disconnect();
    return;
  }

  for (const profile of legacyProfiles) {
    const current = await UserProfileModel.findOne({ userId: profile.userId }).lean();
    if (!current || !isLegacyProfile(current)) {
      continue;
    }

    await cleanupDemoProfile(profile.userId);
  }

  await cleanupLegacyUpdates();

  await mongoose.disconnect();
  console.log("Legacy profile demo cleanup complete.");
}

main().catch(async (error) => {
  console.error("Cleanup failed:", error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
