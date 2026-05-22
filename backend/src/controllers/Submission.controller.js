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

export const getAllSubmissionStats = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  if (!userId) {
    throw new ApiError(400, "User ID is required", "MISSING_USER_ID");
  }

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const submissions = await db.submission.findMany({
    where: {
      userId,
    },
    select: {
      status: true,
      problemId: true,
      language: true,
      createdAt: true,
    },
  });

  const submissionsLast24Hours = await db.submission.count({
    where: {
      userId,
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  const stats = {
    total: submissions.length,
    accepted: 0,
    byLanguage: {},
    solvedProblems: new Set(),
  };

  for (const submission of submissions) {
    stats.byLanguage[submission.language] =
      (stats.byLanguage[submission.language] || 0) + 1;

    if (submission.status === "ACCEPTED") {
      stats.accepted += 1;
      stats.solvedProblems.add(submission.problemId);
    }
  }

  const successRate =
    stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  const mostUsedLanguage =
    Object.entries(stats.byLanguage).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "N/A";

  const dashboardStats = {
    totalSubmissions: stats.total,
    submissionsLast24Hours,
    problemsSolved: stats.solvedProblems.size,
    totalSuccesses: stats.accepted,
    successRate,
    totalLanguagesUsed: Object.keys(stats.byLanguage).length,
    mostUsedLanguage,
  };

  return res.status(200).json(
    new ApiResponse(200, "User submission stats fetched successfully", {
      data: dashboardStats,
    }),
  );
});

export const getSubmissionHeatMap = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  if (!userId) {
    throw new ApiError(400, "User ID is required", "MISSING_USER_ID");
  }

  const submissions = await db.submission.findMany({
    where: {
      userId,
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const countsByDate = new Map();

  for (const submission of submissions) {
    const date = submission.createdAt;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const dateKey = `${year}/${month}/${day}`;
    countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
  }

  const formatted = Array.from(countsByDate.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return res.status(200).json(
    new ApiResponse(200, "User submission heatmap data fetched successfully", {
      data: formatted,
    }),
  );
});
