import express from "express";
import multer from "multer";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { updateUser } from "../controllers/User.controller.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userUpdateSchema } from "../validators/index.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Custom profile update endpoint (keeps Cloudinary upload flow)
router.route("/update")
  .patch(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser)
  .post(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser);

// Forward all other authentication requests to Better Auth handler
router.all("*any", toNodeHandler(auth));

export default router;
