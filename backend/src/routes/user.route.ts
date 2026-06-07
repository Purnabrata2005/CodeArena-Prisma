import express from "express";
import multer from "multer";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { updateUser, getActiveSessions } from "../controllers/User.controller.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userUpdateSchema } from "../validators/index.js";
import { authLimiter, sessionLimiter } from "../middlewares/rateLimiter.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Custom profile update endpoint (keeps Cloudinary upload flow)
router.route("/update")
  .patch(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser)
  .post(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser);

router.route("/sessions")
  .get(verifyToken, getActiveSessions);

// Forward all other authentication requests to Better Auth handler
router.all("*any", (req, res, next) => {
  if (req.method === "GET" && (req.path === "/get-session" || req.originalUrl.endsWith("/get-session"))) {
    return sessionLimiter(req, res, next);
  }
  return authLimiter(req, res, next);
}, toNodeHandler(auth));

export default router;
