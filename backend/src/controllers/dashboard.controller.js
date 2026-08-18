import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscriptionmodel.js";
import { Comment } from "../models/comment.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRequiredUserId = (req) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  return req.user._id;
};

const getChannelStats = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  // 1. Fetch video metrics (total count and views view sum)
  const videoStatsPromise = Video.aggregate([
    { $match: { owner: ownerObjectId } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" }
      }
    }
  ]);

  // 2. Fetch total subscribers directly via countDocuments
  const subscribersPromise = Subscription.countDocuments({ channel: ownerObjectId });

  // 3. Retrieve all video IDs for the creator to query distinct child metrics
  const videosPromise = Video.find({ owner: ownerObjectId }).select("_id").lean();

  const [videoStatsResult, totalSubscribers, videos] = await Promise.all([
    videoStatsPromise,
    subscribersPromise,
    videosPromise
  ]);

  const videoStats = videoStatsResult[0] || { totalVideos: 0, totalViews: 0 };
  const videoIds = videos.map((v) => v._id);

  let totalLikes = 0;
  let totalComments = 0;

  // 4. If creator has videos, fetch likes and comments precisely bounded by index mapping
  if (videoIds.length > 0) {
    const [likesCount, commentsCount] = await Promise.all([
      Like.countDocuments({ video: { $in: videoIds } }),
      Comment.countDocuments({ video: { $in: videoIds } })
    ]);
    totalLikes = likesCount;
    totalComments = commentsCount;
  }

  const result = {
    totalVideos: videoStats.totalVideos,
    totalViews: videoStats.totalViews,
    totalSubscribers,
    totalLikes,
    totalComments
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Channel stats retrieved successfully"));
});

const getChannelVideos = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { page, limit, sortBy = "createdAt", sortType = "desc", query } = req.query;

  const normalizedSortBy = ["createdAt", "views", "title"].includes(sortBy)
    ? sortBy
    : "createdAt";
  const normalizedSortType = String(sortType).toLowerCase() === "asc" ? 1 : -1;
  const searchQuery = query?.trim();

  const filter = {
    owner: ownerId
  };

  if (searchQuery) {
    filter.title = {
      $regex: escapeRegex(searchQuery),
      $options: "i"
    };
  }

  let videosQuery = Video.find(filter)
    .sort({ [normalizedSortBy]: normalizedSortType })
    .select("title description thumbnail videoFile duration views isPublished owner createdAt updatedAt")
    .populate("owner", "username fullname avatar")
    .lean();

 const parsedPage = Number(page ?? 1);
const parsedLimit = Math.min(50, Number(limit ?? 10));

if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw new ApiError(400, "Page must be a positive integer");
}

if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    throw new ApiError(400, "Limit must be a positive integer");
}

const skip = (parsedPage - 1) * parsedLimit;
videosQuery = videosQuery.skip(skip).limit(parsedLimit);
  const videos = await videosQuery;

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos retrieved successfully"));
});

export { getChannelStats, getChannelVideos };
