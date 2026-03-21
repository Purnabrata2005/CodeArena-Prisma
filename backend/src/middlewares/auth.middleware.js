import jwt from "jsonwebtoken";

import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";

export const verifyToken=asyncHandler(async (req, res, next) => {
      const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized", []);
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await db.user.findUnique({
        where: { email: decoded.email },
      })

      if (!user) {
        throw new ApiError(401, "Unauthorized", []);
      }

      // console.log(user);
      req.user = user;
      next();
      
    } catch (error) {
      throw new ApiError(401, "Unauthorized", []);
    }
})


export const checkAdmin=asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized", []);
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden", []);
  }
  next();
})