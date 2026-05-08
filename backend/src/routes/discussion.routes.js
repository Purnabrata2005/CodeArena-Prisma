import express from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  createDiscussion,
  getAllDiscussionsForProblem,
} from "../controllers/Discussion.controller.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { codeReviewSchema } from "../validators/index.js";

const router = express.Router();

router.route("/create/:problemId").post(validate(codeReviewSchema),verifyToken, createDiscussion);

router.route("/:problemId").get(verifyToken, getAllDiscussionsForProblem);

export default router;
