import express from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylistsDetails,
  getAllPlaylistsForUser,
  getPlaylistById,
  removeProblemFromPlaylist,
  updatePlaylist,
} from "../controllers/Playlist.controllers.js";

const router = express.Router();

router.route("/").get(verifyToken, getAllPlaylistsForUser);
router.route("/details").get(verifyToken, getAllPlaylistsDetails);
router.route("/create").post(verifyToken, createPlaylist);
router.route("/details/:playlistId").get(verifyToken, getPlaylistById);
router.route("/:playlistId").delete(verifyToken, deletePlaylist);
router.route("/update/:playlistId").post(verifyToken, updatePlaylist);
router
  .route("/details/:playlistId/add-problem")
  .post(verifyToken, addProblemToPlaylist);
router
  .route("/details/:playlistId/remove-problems")
  .post(verifyToken, removeProblemFromPlaylist);

export default router;
