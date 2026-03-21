import express from "express";

import { validate } from "../middlewares/validator.middlewares.js";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

import {
  createProblem,
  getAllProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  getSovleProblem,
} from "../controllers/Problem.controller.js";

router.route("/create-problem").post(verifyToken, checkAdmin, createProblem);
router.route("/get-all-problem").get(verifyToken,getAllProblem);
router.route("/get-problem/:id").get(verifyToken, getProblemById);
router.route("/update-problem/:id").patch(verifyToken, checkAdmin, updateProblem);
router.route("/delete-problem/:id").delete(verifyToken, checkAdmin, deleteProblem);
router.route("/solve-problem").post(verifyToken, getSovleProblem);

export default router;
