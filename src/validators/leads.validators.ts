import { z } from "zod";

export const leadSubmitSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  mobile: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/),
  email: z.string().trim().email().max(255),
  profession: z.string().trim().max(120).optional(),
  requirement: z.string().trim().max(255).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const leadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "qualified", "closed"]),
});

export const leadDeleteSchema = z.object({
  id: z.string().min(1),
});
