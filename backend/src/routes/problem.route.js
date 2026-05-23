import express from "express";
import multer from "multer";

import { validate } from "../middlewares/validator.middlewares.js";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

import {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  getSovleProblem,
  getUserSolvedRank,
  importProblemsCSV,
  getLeaderboard,
  getUserStreak,
} from "../controllers/Problem.controller.js";

router.route("/create-problem").post(verifyToken, checkAdmin, createProblem);
router.route("/get-all-problem").get(verifyToken,getAllProblem);
router.route("/get-problem/:id").get(verifyToken, getProblemById);
router.route("/update-problem/:id").put(verifyToken, checkAdmin, updateProblem);
router.route("/delete-problem/:id").delete(verifyToken, checkAdmin, deleteProblem);
router.route("/solve-problem").get(verifyToken, getSovleProblem);
router.route("/leaderboard").get(verifyToken, getLeaderboard);
router.route("/user-rank/:id").get(verifyToken, getUserSolvedRank);
router.route("/user-streak/:id").get(verifyToken, getUserStreak);
router.route("/import-problems").post(verifyToken, checkAdmin, upload.single("file"), importProblemsCSV);

export default router;
