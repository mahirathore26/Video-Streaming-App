import { Router } from "express";

import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router
.route("/")
.get(getAllVideos)
.post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
);

router
.route("/:videoId")
.get(verifyJWT, getVideoById)
.patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)
.delete(
    verifyJWT,
    deleteVideo
);

router
.route("/toggle/publish/:videoId")
.patch(
    verifyJWT,
    togglePublishStatus
);

export default router;
