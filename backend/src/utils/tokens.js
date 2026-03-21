import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const genateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const genateRefreshToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const generateTemporaryToken = () => {
  const unHashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes;

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const hasPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};
