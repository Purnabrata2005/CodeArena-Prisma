import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
  hashPassword,
  comparePassword,
} from "../utils/tokens.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";

import { sendEmail } from "../utils/mail.js";
import { emailVerificationMailgenContent } from "../utils/mail.js";
import { UserResponse, options } from "../utils/constants.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(400, "User already exists", []);
  }

  const hashedPassword = await hashPassword(password);
  const username = email.split("@")[0];

  const user = await db.user.create({
    data: {
      name,
      email,
      username,
      password: hashedPassword,
      role: "USER",
    },
  });

  const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();
  await db.user.update({
    where: { email },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: new Date(tokenExpiry),
    },
  });

  //send email to user with the token
  sendEmail({
    email: user?.email,
    username: user?.name || undefined,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.name || user?.email,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify/${unHashedToken}`
    ),
  });

  const createdUser = await db.user.findUnique({ where: { email } });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const responseUser = new UserResponse(createdUser);

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: responseUser,
    }),
  );
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User not found", []);
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, "Email not verified", []);
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials", []);
  }

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  await db.user.update({
    where: { email },
    data: {
      refreshToken,
      accessToken,
    },
  });

  const responseUser = new UserResponse(user, { accessToken, refreshToken });

  res.cookie("refreshToken", refreshToken, options);
  res.cookie("accessToken", accessToken, options);

  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user: responseUser,
    }),
  );
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", options);
  res.clearCookie("accessToken", options);
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not authenticated", []);
  }
  const responseUser = new UserResponse(user);
  return res.status(200).json(
    new ApiResponse(200, "User fetched successfully", {
      user: responseUser,
    }),
  );
});

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

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params as { token: string };

  if (!token) {
    return res.redirect(`${process.env.CLIENT_URL}/login?verification_error=true`);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?verification_error=true`);
  }

  await db.user.update({
    where: { email: user.email },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
});
