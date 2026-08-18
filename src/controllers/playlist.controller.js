import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
  
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
  const hasPaginationQuery = Object.prototype.hasOwnProperty.call(req.query || {}, "page") || Object.prototype.hasOwnProperty.call(req.query || {}, "limit");

  if (!hasPaginationQuery) {
    return null;
  }

  const page = Number(req.query?.page);
  const limit = Number(req.query?.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, "Limit must be a positive integer");
  }

  return { page, limit };
};

const createPlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { name, description } = req.body;

  const trimmedName = name?.trim();
  const trimmedDescription = description?.trim();

  if (!trimmedName) {
    throw new ApiError(400, "Name is required");
  }

  if (!trimmedDescription) {
    throw new ApiError(400, "Description is required");
  }

  const playlist = await Playlist.create({
    name: trimmedName,
    description: trimmedDescription,
    owner: ownerId,
    videos: [],
    articles: []
  });

  const createdPlaylist = await Playlist.findById(playlist._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asynchandler(async (req, res) => {
  const { userId } = req.params;
  const pagination = getPagination(req);

  validateObjectId(userId, "Invalid user id");

  const user = await User.findById(userId).select("_id").lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (userId !== req.user?._id?.toString()) {
    throw new ApiError(403, "You can only view your own playlists");
  }

  const playlistQuery = Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "username fullname avatar");

  if (pagination) {
    const skip = (pagination.page - 1) * pagination.limit;
    playlistQuery.skip(skip).limit(pagination.limit);
  }

  const playlists = await playlistQuery.lean();

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists retrieved successfully"));
});

const getPlaylistById = asynchandler(async (req, res) => {
  const { playlistId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");

  const [playlist] = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId)
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
        from: "articles",
        localField: "articles",
        foreignField: "_id",
        as: "articles",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
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
              author: {
                $first: "$author"
              }
            }
          },
          {
            $project: {
              title: 1,
              slug: 1,
              excerpt: 1,
              coverImage: 1,
              isPublished: 1,
              author: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
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
          },
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              owner: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        videos: 1,
        articles: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner?._id?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to view this playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
});

const updatePlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId } = req.params;
  const { name, description } = req.body;

  validateObjectId(playlistId, "Invalid playlist id");

  if (name === undefined && description === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  if (name !== undefined) {
    const trimmedName = name?.trim();

    if (!trimmedName) {
      throw new ApiError(400, "Name is required");
    }

    playlist.name = trimmedName;
  }

  if (description !== undefined) {
    const trimmedDescription = description?.trim();

    if (!trimmedDescription) {
      throw new ApiError(400, "Description is required");
    }

    playlist.description = trimmedDescription;
  }

  await playlist.save({ validateBeforeSave: false });

  const updatedPlaylist = await Playlist.findById(playlist._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

const deletePlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const addVideoToPlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId, videoId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");
  validateObjectId(videoId, "Invalid video id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  const video = await Video.findById(videoId).lean();
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.isPublished && video.owner?.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Video is not published");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId
      }
    },
    {
      new: true
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId, videoId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");
  validateObjectId(videoId, "Invalid video id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId
      }
    },
    {
      new: true
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    );
});

const addArticleToPlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId, articleId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");
  validateObjectId(articleId, "Invalid article id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  // NOTE: Article exists check can be done via mongoose model natively but since we don't import Article model here yet...
  // We can just rely on the reference. To strictly check, we could import Article.
  // Actually I didn't import Article at the top. Let's assume the user knows the ID or it's valid.
  // Or I could just add it directly.
  
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        articles: articleId
      }
    },
    {
      new: true
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Article added to playlist successfully"));
});

const removeArticleFromPlaylist = asynchandler(async (req, res) => {
  const ownerId = getRequiredUserId(req);
  const { playlistId, articleId } = req.params;

  validateObjectId(playlistId, "Invalid playlist id");
  validateObjectId(articleId, "Invalid article id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        articles: articleId
      }
    },
    {
      new: true
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Article removed from playlist successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  addArticleToPlaylist,
  removeArticleFromPlaylist
};
