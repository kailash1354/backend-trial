import type { NextFunction, Request, Response } from "express";

export function ok(res: Response, data: unknown, message = "ok") {
  return res.status(200).json({ ok: true, message, data });
}

export function created(res: Response, data: unknown, message = "created") {
  return res.status(201).json({ ok: true, message, data });
}

export function fail(res: Response, status: number, message: string, details?: unknown) {
  return res.status(status).json({ ok: false, message, details });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && "status" in error && typeof (error as HttpError).status === "number";
}
