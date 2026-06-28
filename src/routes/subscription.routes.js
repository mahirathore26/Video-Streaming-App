import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId")
    .post(toggleSubscription);
router.route("/channel/:channelId/subscribers").get(getUserChannelSubscribers);
router.route("/subscribed-channels").get(getSubscribedChannels);

export default router;
