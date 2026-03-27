import express from "express";

import { validate } from "../middlewares/validator.middlewares.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

import {
  getAllSubmissions,
  getAllSubmissionCount,
  getAllSubmissionByProblemId,
  getAllSubmissionStats,
  getSubmissionHeatMap,
} from "../controllers/Submission.controller.js";

router.route("/get-all-submissions").get(verifyToken, getAllSubmissions);
router
  .route("/get-submissions-count/:problemId")
  .get(verifyToken, getAllSubmissionCount);
router
  .route("/get-submissions/:problemId")
  .get(verifyToken, getAllSubmissionByProblemId);
router.route("/submission-stats").get(verifyToken, getAllSubmissionStats);
router.route("/heatmap").get(verifyToken, getSubmissionHeatMap);

export default router;
