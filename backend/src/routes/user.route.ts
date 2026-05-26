import express from "express";
import passport from "passport";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

import "../googleConfig/google.config.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  verifyEmail,
} from "../controllers/User.controller.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import { db } from "../db/db.js";
import { options, UserResponse } from "../utils/constants.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
} from "../validators/index.js";

const router = express.Router();

router.route("/register").post(authLimiter, validate(userRegisterSchema), registerUser);
router.route("/verify/:token").get(authLimiter, verifyEmail);
router.route("/login").post(authLimiter, validate(userLoginSchema), loginUser);
router.route("/logout").post(verifyToken, logoutUser);
router.route("/me").get(verifyToken, getUser);
router.route("/update")
  .patch(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser)
  .post(verifyToken, upload.single("avatar"), validate(userUpdateSchema), updateUser);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  async (req: express.Request, res: express.Response): Promise<any> => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    const { id, email } = req.user as any;
    const accessToken = generateAccessToken(id, email);
    const refreshToken = generateRefreshToken(id, email);

    // Save tokens in the database
    await db.user.update({
      where: { email },
      data: {
        accessToken,
        refreshToken,
      },
    });

    const responseUser = new UserResponse(req.user, { accessToken, refreshToken });

    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);

    return res.redirect(`${process.env.CLIENT_URL}`);
  },
);

export default router;
