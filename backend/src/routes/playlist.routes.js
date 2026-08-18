import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  addArticleToPlaylist,
  removeArticleFromPlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId").patch(updatePlaylist);
router.route("/:playlistId").delete(deletePlaylist);
router.route("/:playlistId/video/:videoId").post(addVideoToPlaylist);
router.route("/:playlistId/video/:videoId").delete(removeVideoFromPlaylist);
router.route("/:playlistId/article/:articleId").post(addArticleToPlaylist);
router.route("/:playlistId/article/:articleId").delete(removeArticleFromPlaylist);

export default router;
