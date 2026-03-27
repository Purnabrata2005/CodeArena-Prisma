import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const usreId = req.user.id;

  const submissions = await db.submission.findMany({
    where: {
      userId: usreId,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Submissions fetched successfully", {
      data: submissions,
    }),
  );
});

export const getAllSubmissionByProblemId = asyncHandler(async (req, res) => {
  const usreId = req.user.id;
  const problemId = req.params.problemId;

  if(!problemId) {
    throw new ApiError(400, "Problem ID is required", []);
  }

  const submissions = await db.submission.findMany({
    where: {
      userId: usreId,
      problemId,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Submissions fetched successfully", {
      data: submissions,
    }),
  );
});

export const getAllSubmissionCount = asyncHandler(async (req, res) => {
  const problemId = req.params.problemId;

  if(!problemId) {
    throw new ApiError(400, "Problem ID is required", []);
  }

  const submissionCount = await db.submission.count({
    where: {
      problemId,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Submission count fetched successfully", {
      data: submissionCount,
    }),
  );
});

export const getAllSubmissionStats = asyncHandler(async (req, res) => {});

export const getSubmissionHeatMap = asyncHandler(async (req, res) => {});
