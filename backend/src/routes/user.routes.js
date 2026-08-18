import  { Router } from "express";
import regUser, { loginUser, LogoutUser,refreshAndAccessToken,refreshAccessToken,changeCurrentPassword,getUser,updateAccountDetails,updateUserAvatar,updateCoverImage,getUserChannelDetails,getWatchHistory} from "../controllers/user.controller.js";
import  {upload}  from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
const router=Router();
router.route("/register").post(upload.fields([{
    name:"avatar",
    maxCount:1
},{
    name:"coverimage",
    maxCount:1
}]),regUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,LogoutUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/user-profile").get(verifyJWT,getUser);
router.route("/update-account").put(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/coverimage").patch(verifyJWT,upload.single("coverimage"),updateCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelDetails);
router.route("/history").get(verifyJWT,getWatchHistory);
export default router;
