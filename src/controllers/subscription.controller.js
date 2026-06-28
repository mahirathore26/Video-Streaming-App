import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscriptionmodel.js";
import { User } from "../models/user.model.js";

const getRequiredUserId = (req) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  return req.user._id;
};

const getParamId = (req, keys) => {
  const key = keys.find((item) => req.params?.[item]);
  return key ? req.params[key] : null;
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

const toggleSubscription = asynchandler(async (req, res) => {
  const subscriberId = getRequiredUserId(req);
  const channelId = getParamId(req, ["channelId", "userId", "id"]);

  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  validateObjectId(channelId, "Invalid channel id");

  if (subscriberId.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channelExists = await User.exists({ _id: channelId });
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const deletedSubscription = await Subscription.findOneAndDelete({
    subscriber: subscriberId,
    channel: channelId
  });

  if (deletedSubscription) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: false
        },
        "Channel unsubscribed successfully"
      )
    );
  }

  let subscription;
  try {
    subscription = await Subscription.create({
      subscriber: subscriberId,
      channel: channelId
    });
  } catch (error) {
    if (error?.code === 11000) {
      subscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
      });
    } else {
      throw error;
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        subscription,
        isSubscribed: true
      },
      "Channel subscribed successfully"
    )
  );
});

const getUserChannelSubscribers = asynchandler(async (req, res) => {
  getRequiredUserId(req);
  const channelId = getParamId(req, ["channelId", "userId", "id"]);
  const { limit, skip } = getPagination(req);

  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  validateObjectId(channelId, "Invalid channel id");

  const channelExists = await User.exists({ _id: channelId });
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribersResult = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
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
        subscriber: {
          $first: "$subscriber"
        }
      }
    },
    {
      $project: {
        subscriber: 1,
        channel: 1,
        createdAt: 1
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $facet: {
        metadata: [
          {
            $count: "totalSubscribers"
          }
        ],
        subscribers: [
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

  const subscribers = subscribersResult[0]?.subscribers || [];
  const totalSubscribers = subscribersResult[0]?.metadata?.[0]?.totalSubscribers || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
        totalSubscribers
      },
      "Channel subscribers retrieved successfully"
    )
  );
});

const getSubscribedChannels = asynchandler(async (req, res) => {
  getRequiredUserId(req);
  const subscriberId = getParamId(req, ["subscriberId", "userId", "id"]) || req.user._id;
  const { limit, skip } = getPagination(req);

  validateObjectId(subscriberId, "Invalid subscriber id");

  const subscriberExists = await User.exists({ _id: subscriberId });
  if (!subscriberExists) {
    throw new ApiError(404, "Subscriber not found");
  }

  const subscribedChannelsResult = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
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
        channel: {
          $first: "$channel"
        }
      }
    },
    {
      $project: {
        channel: 1,
        subscriber: 1,
        createdAt: 1
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $facet: {
        metadata: [
          {
            $count: "totalSubscribedChannels"
          }
        ],
        subscribedChannels: [
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

  const subscribedChannels = subscribedChannelsResult[0]?.subscribedChannels || [];
  const totalSubscribedChannels =
    subscribedChannelsResult[0]?.metadata?.[0]?.totalSubscribedChannels || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribedChannels,
        totalSubscribedChannels
      },
      "Subscribed channels retrieved successfully"
    )
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
 
