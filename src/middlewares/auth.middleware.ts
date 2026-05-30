import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { fail } from "../utils/http.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return fail(res, 401, "Unauthorized");

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; roles: string[] };
    req.auth = { userId: payload.sub, roles: payload.roles as any };
    next();
  } catch {
    return fail(res, 401, "Invalid token");
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return fail(res, 401, "Unauthorized");
    const matched = req.auth.roles.some((r) => roles.includes(r));
    if (!matched) return fail(res, 403, "Forbidden");
    next();
  };
}
