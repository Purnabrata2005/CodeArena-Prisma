import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      username?: string | null;
      avatarUrl?: string;
      avatarLocalPath?: string;
      bio?: string | null;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new ApiError(401, "Unauthorized", []);
    }

    req.user = session.user as Express.User;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized", []);
  }
});

export const checkAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized", []);
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden: ADMIN role required", []);
  }
  next();
});
