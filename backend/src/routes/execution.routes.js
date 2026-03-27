import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { executeCode, runCode } from "../controllers/ExecuteCode.controller.js";

const router = express.Router();

router.route("/submit-code").post(verifyToken, executeCode);

router.route("/run-code").post(verifyToken, runCode);

export default router;
