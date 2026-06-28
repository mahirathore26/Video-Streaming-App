import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  getLikedVideos,
  getVideoLikes,
  getCommentLikes
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId")
    .post(toggleVideoLike);

router.route("/comment/:commentId")
    .post(toggleCommentLike);

router.route("/liked-videos")
    .get(getLikedVideos);

router.route("/video/:videoId/likes")
    .get(getVideoLikes);

router.route("/comment/:commentId/likes")
    .get(getCommentLikes);

export default router;
