import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Required to properly handle rate-limiting and secure cookies if deployed behind a reverse proxy (e.g., Nginx, Heroku, Render)
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// Global Rate Limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
    errors: []
  },
  standardHeaders: true,
  legacyHeaders: false,
});


app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);


app.use(
  express.json({
    limit: "16kb"
  })
);
app.use(
  urlencoded({
    extended: true,
    limit: "16kb"
  })
);
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import articleRouter from "./routes/article.routes.js";
import feedRouter from "./routes/feed.routes.js";

// Apply rate limiting exclusively to API routes
app.use("/api/", limiter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/feed", feedRouter);

import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Global Express Error Middleware
app.use(errorHandler);

export { app };