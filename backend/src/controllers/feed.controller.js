import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscriptionmodel.js";
import { Article } from "../models/article.model.js";

// Helper for unified sorting and pagination
const getPagination = (req) => {
  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Explore Feed: Mixed Stories (videos) + Articles
 */
const getExploreFeed = asynchandler(async (req, res) => {
  const { query, sortBy = "createdAt", sortType = "desc" } = req.query;
  const { page, limit, skip } = getPagination(req);

  const videoMatch = { isPublished: true };
  const articleMatch = { isPublished: true };

  if (query?.trim()) {
    const searchRegex = {
      $regex: escapeRegex(query.trim()),
      $options: "i"
    };
    videoMatch.title = searchRegex;
    articleMatch.title = searchRegex;
  }

  const normalizedSortBy = ["createdAt", "views"].includes(sortBy) ? sortBy : "createdAt";
  const normalizedSortType = String(sortType).toLowerCase() === "asc" ? 1 : -1;

  const pipeline = [
    { $match: videoMatch },
    { $addFields: { contentType: "video" } },
    {
      $unionWith: {
        coll: "articles",
        pipeline: [
          { $match: articleMatch },
          { $addFields: { contentType: "article", owner: "$author" } } // normalize owner field
        ]
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
              username: 1,
              fullname: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        author: { $first: "$owner" } // Just alias it back for articles dynamically if needed
      }
    },
    {
      $sort: { [normalizedSortBy]: normalizedSortType }
    },
    {
      $facet: {
        metadata: [{ $count: "totalDocs" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ];

  const results = await Video.aggregate(pipeline);
  const docs = results[0]?.data || [];
  const totalDocs = results[0]?.metadata?.[0]?.totalDocs || 0;
  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const meta = {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage,
    hasPrevPage
  };

  return res.status(200).json(new ApiResponse(200, docs, "Explore feed retrieved successfully", meta));
});

/**
 * Subscriptions Feed: Stories + Articles from subscribed creators
 */
const getSubscriptionFeed = asynchandler(async (req, res) => {
  const subscriberId = req.user._id;
  const { page, limit, skip } = getPagination(req);

  // Find all channels user is subscribed to
  const subscriptions = await Subscription.find({ subscriber: subscriberId }).select("channel");
  const channelIds = subscriptions.map(sub => sub.channel);

  if (channelIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "Subscription feed retrieved successfully", {
      page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
    }));
  }

  const pipeline = [
    { $match: { owner: { $in: channelIds }, isPublished: true } },
    { $addFields: { contentType: "video" } },
    {
      $unionWith: {
        coll: "articles",
        pipeline: [
          { $match: { author: { $in: channelIds }, isPublished: true } },
          { $addFields: { contentType: "article", owner: "$author" } }
        ]
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
              username: 1,
              fullname: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        author: { $first: "$owner" }
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalDocs" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ];

  const results = await Video.aggregate(pipeline);
  const docs = results[0]?.data || [];
  const totalDocs = results[0]?.metadata?.[0]?.totalDocs || 0;
  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const meta = {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage,
    hasPrevPage
  };

  return res.status(200).json(new ApiResponse(200, docs, "Subscription feed retrieved successfully", meta));
});

export {
  getExploreFeed,
  getSubscriptionFeed
};
