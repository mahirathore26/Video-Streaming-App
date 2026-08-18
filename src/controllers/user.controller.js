import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadonCloudinary,
    deleteFromCloudinary,
    extractPublicIdFromCloudinaryUrl
} from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
});

const refreshAndAccessToken = async (UserId) => {
    try {
        const user = await User.findById(UserId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error while generating refresh and access tokens");
    }
};

const regUser= asynchandler( async(req,res)=>{

const {fullname,username,email,password} = req.body;

if([fullname,username,email,password].some((field)=> !field || field.trim() === ""))
{
    throw new ApiError(400,"All fields are required");
}

const existedUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }]
});

if (existedUser) {
    throw new ApiError(409, "User with the same email or username already exists");
}

 const avatarLocalPath=req.files?.avatar?.[0]?.path;
 let coverImageLocalPath;
 if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
    coverImageLocalPath=req.files.coverimage[0].path;
 }
 if(!avatarLocalPath){  
    throw new ApiError(400,"Avatar image is required");}

  const avatar=await uploadonCloudinary(avatarLocalPath);
  const coverimage=await uploadonCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(500,"Failed to upload avatar image");
  }

  let user;

try {
    user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverimage: coverimage?.url || ""
    });
} catch (error) {
    if (avatar?.public_id) {
        await deleteFromCloudinary(avatar.public_id, "image");
    }

    if (coverimage?.public_id) {
        await deleteFromCloudinary(coverimage.public_id, "image");
    }

    throw error;
}
 const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
 )
 if(!createduser){
    throw new ApiError(500,"User registration failed");
 }
 return res.status(201).json(new ApiResponse(201,createduser,"User registered successfully"));
}) 


const loginUser=asynchandler(async(req,res)=>{
   const{email,username,password}=req.body;
   const identifier = email || username;
   if(!identifier || !identifier.trim()){
      throw new ApiError(400,"Username or email is required");   
   }
   if(!password){
    throw new ApiError(400,"Password is required");
   }
  const user = await User.findOne({
    $or:[
        {email: identifier.trim()},
        {username: identifier.trim().toLowerCase()}
    ]
})
   if(!user){
    throw new ApiError(404,"User not found");
   }
  const validpassword = await user.isPasswordCorrect(password);
  if(!validpassword){
    throw new ApiError(401,"Invalid password");
   }

  const {accessToken, refreshToken} = await refreshAndAccessToken(user._id);
  const loggedinUser=await User.findById(user._id).select("-password -refreshToken");
  const options = getCookieOptions();
  return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedinUser,accessToken,refreshToken},"User logged in successfully"));
})

const LogoutUser= asynchandler(async(req,res)=>{
 await User.findByIdAndUpdate(req.user._id,{
  $unset:{
    refreshToken:1
  } 
},
  {
    new:true
  }
)
const options = getCookieOptions();
return res.status(200).clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out successfully"))

})
const refreshAccessToken = asynchandler(async(req,res)=>{
 const incomingrefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if(!incomingrefreshToken){
     throw new ApiError(401,"Unauthorized request");
  }

 const decodedToken = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET);
 const user= await User.findById(decodedToken?._id)
 if(!user){
  throw new ApiError(404,"Invalid refresh token");
 }
 if(incomingrefreshToken !== user?.refreshToken){ 
  throw new ApiError(401,"Refresh token expired or already used");
  }
  const options = getCookieOptions();
  const {accessToken,refreshToken}=await refreshAndAccessToken(user._id);
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed successfully"));
})
const changeCurrentPassword = asynchandler(async(req,res)=>{
  const oldPassword = req.body?.oldPassword ?? req.body?.old;
  const { newPassword } = req.body;
  if(!oldPassword || !newPassword){
    throw new ApiError(400,"Old password and new password are required");
  }
   const  user= await User.findById(req.user._id);
   const isPasswordcorrect = await user.isPasswordCorrect(oldPassword);
   if(!isPasswordcorrect){
    throw new ApiError(400,"Old password is incorrect");
   }
   user.password= newPassword
   await user.save({validateBeforeSave: false});
   return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));
})
const getUser = asynchandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,{user:req.user},"User retrieved successfully"));
})
const updateAccountDetails= asynchandler(async(req,res)=>{
  const {fullname,email}=req.body;
  if(!fullname && !email){
    throw new ApiError(400,"Either fullname or email is required");
  }
  if (email) {
    const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id }
    });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }
}
  const updates = {};
  if(fullname) updates.fullname = fullname;
  if(email) updates.email = email;
  const user =  await User.findByIdAndUpdate(req.user._id,{
    $set: updates
    },
    {new:true}
  ).select("-password -refreshToken");
 return res.status(200).json(new ApiResponse(200,{user},"Account details updated successfully"));
})
const updateUserAvatar = asynchandler(async(req, res) => {
  const avatrLocalPath = req.file?.path;
  if (!avatrLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Fetch the current user to get the old avatar URL before we update it
  const existingUser = await User.findById(req.user._id);
  const oldAvatarUrl = existingUser?.avatar;

  const avatar = await uploadonCloudinary(avatrLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "failed to upload avatar image");
  }

  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true
    }).select("-password -refreshToken");
  } catch (error) {
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id, "image");
    }
    throw error;
  }

  // Database update succeeded. Safe to delete old asset now.
  // Best-effort asynchronous cleanup.
  if (oldAvatarUrl) {
    const oldPublicId = extractPublicIdFromCloudinaryUrl(oldAvatarUrl);
    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId, "image").catch(err => {
        console.error(`Failed to delete old avatar from Cloudinary (${oldPublicId}):`, err);
      });
    }
  }

  return res.status(200).json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});
const updateCoverImage = asynchandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Coverimage is required");
  }

  // Fetch the current user to get the old cover image URL before we update it
  const existingUser = await User.findById(req.user._id);
  const oldCoverUrl = existingUser?.coverimage;

  const coverimage = await uploadonCloudinary(coverImageLocalPath);
  if (!coverimage?.url) {
    throw new ApiError(400, "failed to upload cover image");
  }

  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        coverimage: coverimage.url
      }
    },
    {
      new: true
    }).select("-password -refreshToken");
  } catch (error) {
    if (coverimage?.public_id) {
      await deleteFromCloudinary(coverimage.public_id, "image");
    }
    throw error;
  }

  // Database update succeeded. Safe to delete old asset now.
  // Best-effort asynchronous cleanup.
  if (oldCoverUrl) {
    const oldPublicId = extractPublicIdFromCloudinaryUrl(oldCoverUrl);
    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId, "image").catch(err => {
        console.error(`Failed to delete old cover image from Cloudinary (${oldPublicId}):`, err);
      });
    }
  }

  return res.status(200).json(new ApiResponse(200, { user }, "Cover image updated successfully"));
});
const getUserChannelDetails= asynchandler(async(req,res)=>{
  const {username}=req.params;
  if(!username?.trim()){
    throw new ApiError(400,"Username is required");
  }
  const channel = await User.aggregate([{
    $match:{username:username?.toLowerCase()}
  },{
    $lookup:{
      from :"subscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    }},
    { $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribedTo"
    }},{
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        subscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
  $project: {
    _id: 1,
    fullname: 1,
    username: 1,
    email: 1,
    avatar: 1,
    coverimage: 1,
    subscribersCount: 1,
    subscribedToCount: 1,
    isSubscribed: 1,
    createdAt: 1
  }
}
  ])
  if(!channel.length){
    throw new ApiError(404,"Channel not found");
  }
  return res.status(200).json(new ApiResponse(200, channel[0], "Channel details retrieved successfully"));
})
const getWatchHistory = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("watchHistory");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        _id: { $in: user.watchHistory }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: {
          $first: "$owner"
        }
      }
    }
  ]);

  const orderedHistory = user.watchHistory
    .map(historyId => videos.find(v => v._id.toString() === historyId.toString()))
    .filter(Boolean)
    .reverse();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        watchHistory: orderedHistory
      },
      "Watch history retrieved successfully"
    )
  );
});
export {loginUser, LogoutUser,refreshAndAccessToken,refreshAccessToken,
  changeCurrentPassword,getUser,updateAccountDetails,updateUserAvatar,updateCoverImage,getUserChannelDetails,getWatchHistory};
export default regUser;
