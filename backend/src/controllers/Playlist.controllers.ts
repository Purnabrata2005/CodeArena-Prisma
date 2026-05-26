import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

export const addProblemToPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params as { playlistId: string };
  const { problemIds } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required", ["BAD_REQUEST"]);
  }

  if (!problemIds || !Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Problem IDs are required", ["BAD_REQUEST"]);
  }

  const problemInPlaylist = await db.problemInPlaylist.createMany({
    data: problemIds.map((problemId: string) => ({
      playlistId,
      problemId,
    })),
  });

  return res.status(201).json(
    new ApiResponse(201, "Problem added to playlist successfully", {
      data: problemInPlaylist,
    }),
  );
});

export const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required", []);
  }
  const userId = user.id;

  const playlist = await db.playlist.create({
    data: {
      name,
      description,
      userId,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "Playlist created successfully", {
      data: playlist,
    }),
  );
});

export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params as { playlistId: string };

  const playlist = await db.playlist.findUnique({ where: { id: playlistId } });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found", []);
  }

  await db.playlist.delete({ where: { id: playlistId } });

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", {}));
});

export const getAllPlaylistsDetails = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required", []);
  }
  const playlists = await db.playlist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Playlists fetched successfully", {
      data: playlists,
    }),
  );
});

export const getAllPlaylistsForUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required", []);
  }
  const userId = user.id;

  const playlists = await db.playlist.findMany({
    where: {
      userId,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Playlists fetched successfully", {
      data: playlists,
    }),
  );
});

export const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params as { playlistId: string };
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required", []);
  }
  const userId = user.id;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required", []);
  }

  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found", []);
  }

  return res.status(200).json(
    new ApiResponse(200, "Playlist fetched successfully", {
      data: playlist,
    }),
  );
});

export const removeProblemFromPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params as { playlistId: string };
  const { problemIds } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required", ["BAD_REQUEST"]);
  }

  if (!problemIds || !Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Problem IDs are required", ["BAD_REQUEST"]);
  }

  const problemInPlaylist = await db.problemInPlaylist.deleteMany({
    where: {
      playlistId,
      problemId: {
        in: problemIds,
      },
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "Problem removed from playlist successfully", {
      data: problemInPlaylist,
    }),
  );
});

export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params as { playlistId: string };
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required", ["BAD_REQUEST"]);
  }

  const playlist = await db.playlist.update({
    where: {
      id: playlistId,
    },
    data: {
      name,
      description,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Playlist updated successfully",
    data: playlist,
  });
});
