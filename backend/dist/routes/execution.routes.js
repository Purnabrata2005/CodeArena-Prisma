import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { executeCode, runCode } from "../controllers/executeCode.controller.js";
import { executionLimiter } from "../middlewares/rateLimiter.middleware.js";
const router = express.Router();
router.route("/submit-code").post(verifyToken, executionLimiter, executeCode);
router.route("/run-code").post(verifyToken, executionLimiter, runCode);
export default router;
//# sourceMappingURL=execution.routes.js.map