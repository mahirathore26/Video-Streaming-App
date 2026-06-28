import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const getRequiredUserId = (req) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  return req.user._id;
};

const validateObjectId = (value, message) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, message);
  }
};

const getPagination = (req) => {
  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const toggleLikeForEntity = async ({
  entityId,
  entityField,
  entityLabel,
  model,
  req,
  res
}) => {
  const userId = getRequiredUserId(req);

  validateObjectId(entityId, `Invalid ${entityLabel} id`);

  const entity = await model.findById(entityId).lean();
  if (!entity) {
    throw new ApiError(404, `${entityLabel} not found`);
  }

  if (
    entityField === "video" &&
    entity.isPublished === false &&
    entity.owner?.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Video is not published");
  }

  const existingLike = await Like.findOneAndDelete({
    [entityField]: entityId,
    likedBy: userId
  });

  if (existingLike) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          liked: false
        },
        `${entityLabel} unliked successfully`
      )
    );
  }

  const like = await Like.create({
    [entityField]: entityId,
    likedBy: userId
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        like,
        liked: true
      },
      `${entityLabel} liked successfully`
    )
  );
};

const getLikesForEntity = async ({
  entityId,
  entityField,
  entityLabel,
  model,
  req,
  res
}) => {
  const { limit, skip } = getPagination(req);
  validateObjectId(entityId, `Invalid ${entityLabel} id`);

  const entity = await model.findById(entityId).lean();
  if (!entity) {
    throw new ApiError(404, `${entityLabel} not found`);
  }

  const likesResult = await Like.aggregate([
    {
      $match: {
        [entityField]: new mongoose.Types.ObjectId(entityId)
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
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
        likedBy: {
          $first: "$likedBy"
        }
      }
    },
    {
      $project: {
        likedBy: 1,
        createdAt: 1
      }
    },
    {
      $facet: {
        metadata: [
          {
            $count: "totalLikes"
          }
        ],
        likes: [
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    }
  ]);

  const likes = likesResult[0]?.likes || [];
  const totalLikes = likesResult[0]?.metadata?.[0]?.totalLikes || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalLikes,
        likes
      },
      `${entityLabel} likes retrieved successfully`
    )
  );
};

const toggleVideoLike = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  return toggleLikeForEntity({
    entityId: videoId,
    entityField: "video",
    entityLabel: "Video",
    model: Video,
    req,
    res
  });
});

const toggleCommentLike = asynchandler(async (req, res) => {
  const { commentId } = req.params;

  return toggleLikeForEntity({
    entityId: commentId,
    entityField: "comment",
    entityLabel: "Comment",
    model: Comment,
    req,
    res
  });
});

const getLikedVideos = asynchandler(async (req, res) => {
  const userId = getRequiredUserId(req);
  const { limit, skip } = getPagination(req);

  const likedVideosResult = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: {
          $exists: true,
          $ne: null
        }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
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
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    },
    {
      $addFields: {
        video: {
          $first: "$video"
        }
      }
    },
    {
      $match: {
        video: {
          $ne: null
        }
      }
    },
    {
      $project: {
        video: 1,
        createdAt: 1
      }
    },
    {
      $facet: {
        metadata: [
          {
            $count: "totalLikedVideos"
          }
        ],
        likedVideos: [
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    }
  ]);

  const likedVideos = likedVideosResult[0]?.likedVideos || [];
  const totalLikedVideos = likedVideosResult[0]?.metadata?.[0]?.totalLikedVideos || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedVideos,
        totalLikedVideos
      },
      "Liked videos retrieved successfully"
    )
  );
});

const getVideoLikes = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  return getLikesForEntity({
    entityId: videoId,
    entityField: "video",
    entityLabel: "Video",
    model: Video,
    req,
    res
  });
});

const getCommentLikes = asynchandler(async (req, res) => {
  const { commentId } = req.params;

  return getLikesForEntity({
    entityId: commentId,
    entityField: "comment",
    entityLabel: "Comment",
    model: Comment,
    req,
    res
  });
});

export {
  toggleVideoLike,
  toggleCommentLike,
  getLikedVideos,
  getVideoLikes,
  getCommentLikes
};
