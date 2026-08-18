import { Router } from "express";

import {
  createArticle,
  updateArticle,
  deleteArticle,
  togglePublishStatus,
  getArticleById,
  getPublicArticles,
  getMyArticles,
  toggleArticleBookmark,
  getBookmarkedArticles,
  getArticleSummary
} from "../controllers/article.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.route("/")
  .get(getPublicArticles)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "coverImage",
        maxCount: 1
      }
    ]),
    createArticle
  );

router.route("/my-articles")
  .get(verifyJWT, getMyArticles);

router.route("/bookmarked")
  .get(verifyJWT, getBookmarkedArticles);

// Placing /:articleId at the bottom because it's a dynamic slug/id route
router.route("/:articleId/summary")
  .get(getArticleSummary);

router.route("/:articleId")
  .get(getArticleById)
  .patch(
    verifyJWT,
    upload.fields([
      {
        name: "coverImage",
        maxCount: 1
      }
    ]),
    updateArticle
  )
  .delete(
    verifyJWT,
    deleteArticle
  );

router.route("/toggle/publish/:articleId")
  .patch(
    verifyJWT,
    togglePublishStatus
  );

router.route("/toggle/bookmark/:articleId")
  .patch(
    verifyJWT,
    toggleArticleBookmark
  );

export default router;
