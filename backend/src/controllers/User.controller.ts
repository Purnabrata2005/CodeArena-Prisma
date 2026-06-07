import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import path from "path";
import fs from "fs";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { UserResponse } from "../utils/constants.js";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
// @ts-ignore
import geoLookup from "offline-geo-from-ip";

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not authenticated", []);
  }

  const { name, bio } = req.body;
  const updateData: Record<string, any> = { name, bio };

  if (req.file) {
    const file = req.file;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, "avatars");
    const avatarUrl = result.secure_url;
    const avatarLocalPath = result.public_id; // Storing public_id for easy deletion

    updateData.avatarLocalPath = avatarLocalPath;
    updateData.avatarUrl = avatarUrl;

    // Clean up old avatar if it exists
    if (user.avatarLocalPath) {
      if (user.avatarLocalPath.startsWith("public/avatars/")) {
        // Old local file cleanup
        const oldPath = path.join(process.cwd(), user.avatarLocalPath);
        try {
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (err) {
          console.error("Failed to delete old local avatar file:", err);
        }
      } else {
        // Cloudinary cleanup
        await deleteFromCloudinary(user.avatarLocalPath);
      }
    }
  }

  const updatedUser = await db.user.update({
    where: { email: user.email },
    data: updateData,
  });

  const responseUser = new UserResponse(updatedUser);

  return res.status(200).json(
    new ApiResponse(200, "User updated successfully", {
      user: responseUser,
    }),
  );
});

export const getActiveSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await auth.api.listSessions({
    headers: fromNodeHeaders(req.headers),
  });

  const decoratedSessions = sessions.map((s) => {
    const ip = s.ipAddress;
    let location = null;

    if (ip) {
      if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("fe80")) {
        location = {
          city: "Localhost",
          country: "Localhost",
          region: "Local",
        };
      } else {
        try {
          location = {
            city: geoLookup.city(ip) || "Unknown City",
            country: geoLookup.country(ip) || "Unknown Country",
            region: geoLookup.state(ip) || "Unknown Region",
          };
        } catch (e) {
          console.error("GeoIP lookup failed for IP:", ip, e);
        }
      }
    }

    return {
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      location,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, "Active sessions retrieved successfully", {
      sessions: decoratedSessions,
    })
  );
});
