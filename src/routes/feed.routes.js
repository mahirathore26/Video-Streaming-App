import { Router } from "express";
import { getExploreFeed, getSubscriptionFeed } from "../controllers/feed.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

// /api/v1/feed

// Public route for explore feed (requires no auth but can accept optional auth if preferred, though usually explore is public)
router.route("/explore").get(getExploreFeed);

// Protected routes
router.use(verifyJWT);
router.route("/subscriptions").get(getSubscriptionFeed);

export default router;
