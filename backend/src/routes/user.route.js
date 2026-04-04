import express from "express";
import passport from "passport";

import "../googleConfig/google.config.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  verifyEmail,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { genateAccessToken } from "../utils/tokens.js";
import { options, UserResponse } from "../utils/constants.js";

import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
} from "../validators/index.js";

const router = express.Router();

router.route("/register").post(validate(userRegisterSchema), registerUser);
router.route("/verify/:token").get(verifyEmail);
router.route("/login").post( validate(userLoginSchema),loginUser);
router.route("/logout").post(verifyToken, logoutUser);
router.route("/me").get(verifyToken, getUser);
router.route("/update").patch(verifyToken, validate(userUpdateSchema), updateUser);

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
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    const { id, email } = req.user;
    const accessToken = genateAccessToken(id, email);
    const responseUser = new UserResponse(req.user, { accessToken });

    res.cookie("accessToken", accessToken, options);

    return res.redirect(`${process.env.CLIENT_URL}`);
  },
);

export default router;
