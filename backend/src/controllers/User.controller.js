import {
  genateAccessToken,
  genateRefreshToken,
  generateTemporaryToken,
  hasPassword,
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

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(400, "User already exists", []);
  }

  const hashedPassword = await hasPassword(password);
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
    username: user?.name,
    mailgenContent: emailVerificationMailgenContent(
      user?.name,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/auth/verify/${unHashedToken}`,
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
export const loginUser = asyncHandler(async (req, res) => {
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

  const accessToken = genateAccessToken(user.id, user.email);
  const refreshToken = genateRefreshToken(user.id, user.email);

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
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", options);
  res.clearCookie("accessToken", options);
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});
export const getUser = asyncHandler(async (req, res) => {
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
export const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not authenticated", []);
  }

  const { name, bio } = req.body;

  const updatedUser = await db.user.update({
    where: { email: user.email },
    data: {
      name,
      bio,
    },
  });

  const responseUser = new UserResponse(updatedUser);

  return res.status(200).json(
    new ApiResponse(200, "User updated successfully", {
      user: responseUser,
    }),
  );
});
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Token not provided", []);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token", []);
  }

  await db.user.update({
    where: { email: user.email },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully", {}));
});
