import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { fail } from "../utils/http.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, 400, "Validation failed", parsed.error.flatten());
    req.body = parsed.data;
    next();
  };
}
