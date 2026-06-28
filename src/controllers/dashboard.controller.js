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

  const [stats] = await Video.aggregate([
    {
      $match: {
        owner: ownerObjectId
      }
    },
    {
      $facet: {
        totalVideos: [{ $count: "count" }],
        totalViews: [{ $group: { _id: null, totalViews: { $sum: "$views" } } }],
        totalLikes: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "videoLikes"
            }
          },
          { $unwind: "$videoLikes" },
          { $group: { _id: null, totalLikes: { $sum: 1 } } }
        ],
        totalComments: [
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "videoComments"
            }
          },
          { $unwind: "$videoComments" },
          { $group: { _id: null, totalComments: { $sum: 1 } } }
        ]
      }
    },
    {
      $project: {
        totalVideos: { $ifNull: [{ $arrayElemAt: ["$totalVideos.count", 0] }, 0] },
        totalViews: { $ifNull: [{ $arrayElemAt: ["$totalViews.totalViews", 0] }, 0] },
        totalLikes: { $ifNull: [{ $arrayElemAt: ["$totalLikes.totalLikes", 0] }, 0] },
        totalComments: { $ifNull: [{ $arrayElemAt: ["$totalComments.totalComments", 0] }, 0] }
      }
    }
  ]);

  const [subscriberStats] = await Subscription.aggregate([
    {
      $match: {
        channel: ownerObjectId
      }
    },
    {
      $count: "count"
    }
  ]);

  const result = {
    totalVideos: stats?.totalVideos || 0,
    totalViews: stats?.totalViews || 0,
    totalSubscribers: subscriberStats?.count || 0,
    totalLikes: stats?.totalLikes || 0,
    totalComments: stats?.totalComments || 0
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
