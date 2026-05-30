import { z } from "zod";

export const pageBundleSchema = z.object({
  pageKey: z.string().min(1),
  routePath: z.string().min(1),
});

export const upsertSchema = z.record(z.string(), z.unknown());
