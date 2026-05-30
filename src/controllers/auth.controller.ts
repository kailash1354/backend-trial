import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { fail, HttpError, ok } from "../utils/http.js";

const refreshCookie = "dh_refresh";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/api/v1/auth/refresh",
  });
}

export const AuthController = {
  async register(req: Request, res: Response) {
    const data = await AuthService.register(req.body);
    return ok(res, data, "verification email sent");
  },

  async signup(req: Request, res: Response) {
    return AuthController.register(req, res);
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await AuthService.login(req.body);
    setRefreshCookie(res, refreshToken);
    return ok(res, { user, accessToken }, "login success");
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[refreshCookie] as string | undefined;
    if (!token) {
      throw new HttpError(401, "Missing refresh cookie");
    }
    const data = await AuthService.refresh(token);
    setRefreshCookie(res, data.refreshToken);
    return ok(res, { accessToken: data.accessToken, user: data.user }, "refresh success");
  },

  async verifyEmail(req: Request, res: Response) {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token) {
      return res.redirect(302, `${env.CLIENT_URL}/login?verified=0&reason=missing-token`);
    }

    try {
      await AuthService.verifyEmail(token);
      return res.redirect(302, `${env.CLIENT_URL}/login?verified=1`);
    } catch {
      return res.redirect(302, `${env.CLIENT_URL}/login?verified=0&reason=invalid-token`);
    }
  },

  async resendVerification(req: Request, res: Response) {
    await AuthService.resendVerification(req.body);
    return ok(res, { sent: true }, "verification email sent");
  },

  async me(req: Request, res: Response) {
    const user = await UserRepository.findById(req.auth!.userId);
    if (!user) {
      return fail(res, 401, "Unauthorized");
    }
    return ok(res, {
      userId: req.auth!.userId,
      roles: user?.roles || [],
      email: user?.email || null,
      fullName: user?.fullName || null,
      isEmailVerified: Boolean(user?.isEmailVerified),
    });
  },

  async logout(req: Request, res: Response) {
    if (req.auth?.userId) await AuthService.logoutEverywhere(req.auth.userId);
    res.clearCookie(refreshCookie, { path: "/api/v1/auth/refresh" });
    return ok(res, {}, "logout success");
  },

  async forgotPassword(req: Request, res: Response) {
    await AuthService.forgotPassword(req.body);
    return ok(res, {}, "If the email exists, a reset link has been sent");
  },

  async resetPassword(req: Request, res: Response) {
    await AuthService.resetPassword({
      ...req.body,
      browser: req.headers["user-agent"] || null,
      ipAddress: req.ip || null,
    });
    return ok(res, {}, "Password reset success");
  },
};
