import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import { errorHandler } from "./middlewares/error.middleware.js";


const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());
app.use(passport.initialize());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

import userRouter from "./routes/user.route.js";
import problemRouter from "./routes/problem.route.js"
import executionRouter from "./routes/execution.routes.js"
import submissionRouter from "./routes/submission.routes.js"
import playlistRouter from "./routes/playlist.routes.js"

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/problem",problemRouter)
app.use("/api/v1/execute-code", executionRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/playlist", playlistRouter);

app.use(errorHandler);

export default app;
