import express from "express";

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
router.route("/update").patch(verifyToken,validate(userUpdateSchema) ,updateUser);

export default router;
