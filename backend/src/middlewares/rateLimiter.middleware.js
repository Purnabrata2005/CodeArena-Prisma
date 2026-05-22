import { rateLimit } from "express-rate-limit";

export const executionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // Limit each IP to 10 requests per window
  standardHeaders: "draft-7", // Use modern RateLimit headers
  legacyHeaders: false, // Disable the legacy X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many code execution requests from this IP, please try again after 5 minutes.",
  },
});
