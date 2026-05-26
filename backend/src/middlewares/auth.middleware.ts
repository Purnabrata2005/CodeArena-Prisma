import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";

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

interface DecodedToken extends jwt.JwtPayload {
  userId: string;
  email: string;
}

export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized", []);
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as DecodedToken;
    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new ApiError(401, "Unauthorized", []);
    }

    req.user = user as Express.User;
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
