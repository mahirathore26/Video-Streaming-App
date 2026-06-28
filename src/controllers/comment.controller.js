import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

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

  return { page, limit };
};

const createComment = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { videoId } = req.params;
  const { content } = req.body;

  validateObjectId(videoId, "Invalid video id");

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const video = await Video.findById(videoId).lean();
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.isPublished && video.owner?.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Video is not published");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: ownerId
  });

  const createdComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment created successfully"));
});

const getVideoComments = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { page, limit } = getPagination(req);
  const requesterId = req.user?._id;

  validateObjectId(videoId, "Invalid video id");

  const video = await Video.findById(videoId).lean();
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.isPublished && video.owner?.toString() !== requesterId?.toString()) {
    throw new ApiError(403, "Video is not published");
  }

  const pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
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
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes"
      }
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes"
        }
      }
    },
    {
      $project: {
        content: 1,
        video: 1,
        owner: 1,
        likeCount: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ];

  const commentAggregate = Comment.aggregate(pipeline);
  const comments = await Comment.aggregatePaginate(commentAggregate, {
    page,
    limit
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Video comments retrieved successfully"));
});

const updateComment = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { commentId } = req.params;
  const { content } = req.body;

  validateObjectId(commentId, "Invalid comment id");

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  comment.content = content.trim();
  await comment.save({ validateBeforeSave: false });

  const updatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { commentId } = req.params;

  validateObjectId(commentId, "Invalid comment id");

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Like.deleteMany({ comment: comment._id });
  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { createComment, getVideoComments, updateComment, deleteComment };
