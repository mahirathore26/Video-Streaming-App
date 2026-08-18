import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Article } from "../models/article.model.js";
import { ArticleBookmark } from "../models/articleBookmark.model.js";
import { deleteFromCloudinary, uploadonCloudinary } from "../utils/fileUpload.js";
import { generateArticleSummary as getAiSummary } from "../services/ai.service.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MAX_TITLE_LENGTH = 120;
const MAX_PAGE_SIZE = 50;

const getCloudinaryFileUrl = (file) => file?.secure_url || file?.url || null;

const generateSlug = (title) => {
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${slug}-${Date.now().toString(36)}`;
};

const createArticle = asynchandler(async (req, res) => {
  const { title, content, excerpt, tags } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    throw new ApiError(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }

  let coverImageUrl = "";
  const coverImageLocalPath = req.file?.path || req.files?.coverImage?.[0]?.path;

  if (coverImageLocalPath) {
    const uploadedCover = await uploadonCloudinary(coverImageLocalPath);
    coverImageUrl = getCloudinaryFileUrl(uploadedCover);

    if (!coverImageUrl) {
      throw new ApiError(500, "Failed to upload cover image");
    }
  }

  let parsedTags = [];
  if (tags) {
    parsedTags = Array.isArray(tags) ? tags : String(tags).split(",").map(t => t.trim()).filter(Boolean);
  }

  const slug = generateSlug(title.trim());

  const article = await Article.create({
    title: title.trim(),
    slug,
    content: content.trim(),
    excerpt: excerpt ? excerpt.trim() : "",
    coverImage: coverImageUrl,
    author: req.user._id,
    isPublished: false,
    tags: parsedTags,
  });

  return res.status(201).json(new ApiResponse(201, article, "Article draft created successfully"));
});

const updateArticle = asynchandler(async (req, res) => {
  const { articleId } = req.params;
  const { title, content, excerpt, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (article.author.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to update this article");
  }

  if (title?.trim()) {
    if (title.trim().length > MAX_TITLE_LENGTH) {
      throw new ApiError(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
    }
    article.title = title.trim();
  }

  if (content?.trim()) {
    article.content = content.trim();
  }

  if (excerpt !== undefined) {
    article.excerpt = String(excerpt).trim();
  }

  if (tags !== undefined) {
    article.tags = Array.isArray(tags) ? tags : String(tags).split(",").map(t => t.trim()).filter(Boolean);
  }

  const coverImageLocalPath = req.file?.path || req.files?.coverImage?.[0]?.path;

  if (coverImageLocalPath) {
    const uploadedCover = await uploadonCloudinary(coverImageLocalPath);
    const coverUrl = getCloudinaryFileUrl(uploadedCover);

    if (!coverUrl) {
      throw new ApiError(500, "Failed to upload cover image");
    }

    // Attempt to delete old cover if it's from cloudinary
    if (article.coverImage && article.coverImage.includes("cloudinary.com")) {
      const publicId = article.coverImage.split('/').pop().split('.')[0]; 
      if (publicId) {
        // Just fire and forget
        deleteFromCloudinary(publicId, "image").catch(() => {});
      }
    }

    article.coverImage = coverUrl;
  }

  await article.save({ validateBeforeSave: false });

  const updatedArticle = await Article.findById(article._id).populate("author", "username fullname avatar");

  return res.status(200).json(new ApiResponse(200, updatedArticle, "Article updated successfully"));
});

const togglePublishStatus = asynchandler(async (req, res) => {
  const { articleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (article.author.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to update this article");
  }

  article.isPublished = !article.isPublished;
  if (article.isPublished && !article.publishedAt) {
    article.publishedAt = new Date();
  }
  
  await article.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, article, "Article publish status updated successfully")
  );
});

const deleteArticle = asynchandler(async (req, res) => {
  const { articleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (article.author.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to delete this article");
  }

  if (article.coverImage && article.coverImage.includes("cloudinary.com")) {
    const publicId = article.coverImage.split('/').pop().split('.')[0]; 
    if (publicId) {
      deleteFromCloudinary(publicId, "image").catch(() => {});
    }
  }

  await ArticleBookmark.deleteMany({ article: articleId });
  await Article.findByIdAndDelete(articleId);

  return res.status(200).json(new ApiResponse(200, {}, "Article deleted successfully"));
});

const getArticleById = asynchandler(async (req, res) => {
  const { articleId } = req.params;

  // Let's support both slug and ID
  const isObjectId = mongoose.Types.ObjectId.isValid(articleId);
  const query = isObjectId ? { _id: articleId } : { slug: articleId };

  const article = await Article.findOne(query).populate("author", "username fullname avatar");

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  const isAuthor = req.user?._id?.toString() === article.author?._id?.toString();

  if (!article.isPublished && !isAuthor) {
    throw new ApiError(403, "Article is not published");
  }

  return res.status(200).json(new ApiResponse(200, article, "Article retrieved successfully"));
});

const getPublicArticles = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, authorId } = req.query;

  const matchStage = {
    isPublished: true
  };

  if (authorId) {
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      throw new ApiError(400, "Invalid author id");
    }
    matchStage.author = new mongoose.Types.ObjectId(authorId);
  }

  if (query?.trim()) {
    matchStage.title = {
      $regex: escapeRegex(query.trim()),
      $options: "i"
    };
  }

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit)));

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [{ $project: { username: 1, fullname: 1, avatar: 1 } }]
      }
    },
    { $addFields: { author: { $first: "$author" } } },
    { $sort: { publishedAt: -1, createdAt: -1 } }
  ];

  const aggregate = Article.aggregate(pipeline);
  const paginatedResults = await Article.aggregatePaginate(aggregate, { page: parsedPage, limit: parsedLimit });

  const meta = {
    page: paginatedResults.page,
    limit: paginatedResults.limit,
    totalDocs: paginatedResults.totalDocs,
    totalPages: paginatedResults.totalPages,
    hasNextPage: paginatedResults.hasNextPage,
    hasPrevPage: paginatedResults.hasPrevPage
  };

  return res.status(200).json(new ApiResponse(200, paginatedResults.docs, "Articles retrieved successfully", meta));
});

const getMyArticles = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, filter } = req.query;

  const matchStage = {
    author: new mongoose.Types.ObjectId(req.user._id)
  };

  if (filter === "published") {
    matchStage.isPublished = true;
  } else if (filter === "draft") {
    matchStage.isPublished = false;
  }

  if (query?.trim()) {
    matchStage.title = {
      $regex: escapeRegex(query.trim()),
      $options: "i"
    };
  }

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit)));

  const pipeline = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } }
  ];

  const aggregate = Article.aggregate(pipeline);
  const paginatedResults = await Article.aggregatePaginate(aggregate, { page: parsedPage, limit: parsedLimit });

  const meta = {
    page: paginatedResults.page,
    limit: paginatedResults.limit,
    totalDocs: paginatedResults.totalDocs,
    totalPages: paginatedResults.totalPages,
    hasNextPage: paginatedResults.hasNextPage,
    hasPrevPage: paginatedResults.hasPrevPage
  };

  return res.status(200).json(new ApiResponse(200, paginatedResults.docs, "Your articles retrieved successfully", meta));
});

const toggleArticleBookmark = asynchandler(async (req, res) => {
  const { articleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findById(articleId);
  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  const existingBookmark = await ArticleBookmark.findOne({
    article: articleId,
    user: req.user._id
  });

  if (existingBookmark) {
    await ArticleBookmark.findByIdAndDelete(existingBookmark._id);
    return res.status(200).json(new ApiResponse(200, { bookmarked: false }, "Article removed from bookmarks"));
  } else {
    await ArticleBookmark.create({
      article: articleId,
      user: req.user._id
    });
    return res.status(200).json(new ApiResponse(200, { bookmarked: true }, "Article added to bookmarks"));
  }
});

const getBookmarkedArticles = asynchandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit)));

  const pipeline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "articles",
        localField: "article",
        foreignField: "_id",
        as: "article",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [{ $project: { username: 1, fullname: 1, avatar: 1 } }]
            }
          },
          { $addFields: { author: { $first: "$author" } } }
        ]
      }
    },
    { $addFields: { article: { $first: "$article" } } },
    { $sort: { createdAt: -1 } }
  ];

  const aggregate = ArticleBookmark.aggregate(pipeline);
  const paginatedResults = await ArticleBookmark.aggregatePaginate(aggregate, { page: parsedPage, limit: parsedLimit });

  const meta = {
    page: paginatedResults.page,
    limit: paginatedResults.limit,
    totalDocs: paginatedResults.totalDocs,
    totalPages: paginatedResults.totalPages,
    hasNextPage: paginatedResults.hasNextPage,
    hasPrevPage: paginatedResults.hasPrevPage
  };

  const docs = paginatedResults.docs.map(bm => ({
    ...bm.article,
    bookmarkId: bm._id,
    bookmarkedAt: bm.createdAt
  })).filter(a => a._id); // Ensure article still exists

  return res.status(200).json(new ApiResponse(200, docs, "Bookmarked articles retrieved successfully", meta));
});

const getArticleSummary = asynchandler(async (req, res) => {
  const { articleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid article id");
  }

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  // If the article is not published, only the author can request a summary
  if (!article.isPublished && article.author.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Article is not published");
  }

  // If we already have a generated summary, return it instantly
  if (article.aiSummary && article.aiSummary.trim().length > 0) {
    return res.status(200).json(new ApiResponse(200, { summary: article.aiSummary }, "AI summary retrieved from cache"));
  }

  // Generate new summary
  const summary = await getAiSummary(article.content);
  
  // Save it back to the database
  article.aiSummary = summary;
  await article.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { summary }, "AI summary generated successfully"));
});

export {
  createArticle,
  updateArticle,
  togglePublishStatus,
  deleteArticle,
  getArticleById,
  getPublicArticles,
  getMyArticles,
  toggleArticleBookmark,
  getBookmarkedArticles,
  getArticleSummary
};
