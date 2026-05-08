import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const discussionUserSelect = {
  id: true,
  name: true,
  avatar: true,
};

const normalizeDiscussion = (discussion) => ({
  ...discussion,
  message: discussion.massage,
});

export const createDiscussion = asyncHandler(async (req, res) => {
  const message = req.body.message;
  const { problemId } = req.params;
  const { id: userId } = req.user;

  if (!problemId) {
    throw new ApiError(400, "Problem ID is required", []);
  }

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message is required", []);
  }

  const discussion = await db.discussionTable.create({
    data: {
      userId,
      problemId,
      massage: message.trim(),
    },
  });

  const createdDiscussion = await db.discussionTable.findUnique({
    where: {
      id: discussion.id,
    },
    select: {
      id: true,
      massage: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: discussionUserSelect,
      },
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Discussion created successfully",
      normalizeDiscussion(createdDiscussion),
    ),
  );
});

export const getAllDiscussionsForProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId) {
    throw new ApiError(400, "Problem ID is required", []);
  }

  const discussions = await db.discussionTable.findMany({
    where: {
      problemId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      massage: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: discussionUserSelect,
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Discussions fetched successfully",
      discussions.map(normalizeDiscussion),
    ),
  );
});