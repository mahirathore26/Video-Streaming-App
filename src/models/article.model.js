import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    coverImage: {
      type: String, // Cloudinary url
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes similar to Video model to help with queries
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ isPublished: 1, publishedAt: -1 });
articleSchema.index({ slug: 1 });

articleSchema.plugin(mongooseAggregatePaginate);
export const Article = mongoose.model("Article", articleSchema);
