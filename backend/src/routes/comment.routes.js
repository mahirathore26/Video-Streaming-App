import { Router } from "express";
import {
  createComment,
  getVideoComments,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/:videoId")
    .post(createComment)
    .get(getVideoComments);

router.route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;
