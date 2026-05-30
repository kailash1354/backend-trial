import type { NextFunction, Request, Response } from "express";
import { fail, isHttpError } from "../utils/http.js";

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, "Route not found");
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (isHttpError(err)) {
    return fail(res, err.status, err.message, err.details);
  }

  return fail(res, 500, err.message || "Internal server error");
}
