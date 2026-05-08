import express from "express";

const router = express.Router();

import { verifyToken } from "../middlewares/auth.middleware.js";

import { getCodeReview } from "../controllers/CodeReview.controller.js";

router.route("/").post(verifyToken, getCodeReview);

export default router;