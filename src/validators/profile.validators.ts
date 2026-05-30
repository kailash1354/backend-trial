import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  profession: z.string().trim().min(2).max(80),
  specialization: z.string().trim().min(2).max(120),
  clinicType: z.string().trim().min(2).max(120),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
  yearsOfPractice: z.coerce.number().min(0).max(80),
  phone: z.string().trim().min(7).max(30),
  preferredClinicSize: z.string().trim().min(2).max(80),
  budgetRange: z.string().trim().min(2).max(80),
  investmentIntent: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  relationshipManager: z.string().trim().max(120).optional().or(z.literal("")),
  inquiryStatus: z.string().trim().max(120).optional().or(z.literal("")),
  preferredUnitTypes: z.array(z.string().trim().min(2)).default([]),
  notes: z.string().trim().max(600).optional().or(z.literal("")),
});

export const toggleInterestSchema = z.object({
  category: z.enum(["space", "floor-plan", "amenity", "investment", "document"]),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  href: z.string().trim().max(200).optional().or(z.literal("")),
  label: z.string().trim().max(80).optional().or(z.literal("")),
});

export const requestVisitSchema = z.object({
  visitAt: z.string().datetime(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
