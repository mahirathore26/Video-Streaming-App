import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Enable CORS with credentials so authenticated cookie-based requests work.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
  })
);

// Keep the JSON body limit and add the same limit to URL-encoded requests.
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

// Register the existing routers under the shared API prefix.
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1", commentRouter);
app.use("/api/v1", likeRouter);
app.use("/api/v1", subscriptionRouter);
app.use("/api/v1", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };