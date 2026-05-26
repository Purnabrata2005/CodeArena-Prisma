import express from "express";

const router = express.Router();

import { verifyToken } from "../middlewares/auth.middleware.js";

import { getCodeReview } from "../controllers/Codereview.controller.js";

router.route("/").post(verifyToken, getCodeReview);

export default router;
