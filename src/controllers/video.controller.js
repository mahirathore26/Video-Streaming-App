import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary, uploadonCloudinary } from "../utils/fileUpload.js";
import mongoose from "mongoose";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_PAGE_SIZE = 50;

const getCloudinaryFileUrl = (file) => file?.secure_url || file?.url || null;

const validateVideoTextFields = (title, description) => {
  if ([title, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    throw new ApiError(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }

  if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    throw new ApiError(
      400,
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
    );
  }
};

const uploadVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  validateVideoTextFields(title, description);

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Both video file and thumbnail are required");
  }

  const uploadedVideo = await uploadonCloudinary(videoFileLocalPath);
  const videoFileUrl = getCloudinaryFileUrl(uploadedVideo);

  if (!videoFileUrl || !uploadedVideo?.public_id) {
    throw new ApiError(500, "Failed to upload video file");
  }

  const uploadedThumbnail = await uploadonCloudinary(thumbnailLocalPath);
  const thumbnailUrl = getCloudinaryFileUrl(uploadedThumbnail);

  if (!thumbnailUrl || !uploadedThumbnail?.public_id) {
    await deleteFromCloudinary(uploadedVideo.public_id, uploadedVideo.resource_type || "video");
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  const video = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile: videoFileUrl,
    videoPublicId: uploadedVideo.public_id,
    thumbnail: thumbnailUrl,
    thumbnailPublicId: uploadedThumbnail.public_id,
    duration: uploadedVideo.duration||0,
    owner: req.user._id
  });

  if (!video) {
    throw new ApiError(500, "Video upload failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullname avatar"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const isOwner = req.user?._id?.toString() === video.owner?._id?.toString();

  if (!video.isPublished && !isOwner) {
    throw new ApiError(403, "Video is not published");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    {
      $inc: {
        views: 1
      }
    },
    {
      new: true
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video retrieved successfully"));
});

const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (!title && !description && !req.file && !req.files?.thumbnail?.[0]?.path) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title?.trim()) {
    if (title.trim().length > MAX_TITLE_LENGTH) {
      throw new ApiError(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
    }
    video.title = title.trim();
  }

  if (description?.trim()) {
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      throw new ApiError(
        400,
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
      );
    }
    video.description = description.trim();
  }

  const thumbnailLocalPath = req.file?.path || req.files?.thumbnail?.[0]?.path;

  if (thumbnailLocalPath) {
    const uploadedThumbnail = await uploadonCloudinary(thumbnailLocalPath);
    const thumbnailUrl = getCloudinaryFileUrl(uploadedThumbnail);

    if (!thumbnailUrl || !uploadedThumbnail?.public_id) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }

    const oldThumbnailPublicId = video.thumbnailPublicId;
    video.thumbnail = thumbnailUrl;
    video.thumbnailPublicId = uploadedThumbnail.public_id;

    if (oldThumbnailPublicId) {
      await deleteFromCloudinary(oldThumbnailPublicId, "image");
    }
  }

  await video.save({ validateBeforeSave: false });

  const updatedVideo = await Video.findById(video._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await deleteFromCloudinary(video.videoPublicId, "video");
  await deleteFromCloudinary(video.thumbnailPublicId, "image");
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  const updatedVideo = await Video.findById(video._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video publish status updated successfully")
    );
});

const getAllVideos = asynchandler(async (req, res) => {
  const {
    page: rawPage = 1,
    limit: rawLimit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId
  } = req.query;

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const matchStage = {
    isPublished: true
  };

  if (query?.trim()) {
    matchStage.title = {
      $regex: escapeRegex(query.trim()),
      $options: "i"
    };
  }

  if (userId) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  const page = Math.max(1, Number(rawPage) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(rawLimit) || 10));

  const allowedSortFields = ["createdAt", "updatedAt", "title", "views", "duration"];
  const normalizedSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const normalizedSortType = String(sortType).toLowerCase() === "asc" ? 1 : -1;

  const pipeline = [
    {
      $match: matchStage
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
      $sort: {
        [normalizedSortBy]: normalizedSortType
      }
    }
  ];

  const videoAggregate = Video.aggregate(pipeline);
  const options = {
    page,
    limit
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos retrieved successfully"));
});

export {
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos
};
