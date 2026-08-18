import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";

const errorHandler = (err, req, res, next) => {
  // If headers have already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Safely clean up any leftover local Multer files asynchronously.
  // We ignore errors (e.g. file doesn't exist) to keep cleanup robust.
  try {
    if (req.file && req.file.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (file.path) fs.promises.unlink(file.path).catch(() => {});
        });
      } else {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (file.path) fs.promises.unlink(file.path).catch(() => {});
          });
        });
      }
    }
  } catch (cleanupError) {
    console.error("Error initiating temp file cleanup:", cleanupError);
  }

  let error = err;

  // Handle Mongoose / unknown errors that are not ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.stack || "", []);
  }

  // Mask internal 500 errors in production to prevent leaking DB paths or sensitive details
  if (process.env.NODE_ENV === "production" && error.statusCode === 500) {
    error.message = "Internal Server Error";
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  // Ensure consistent JSON response format based on your app's conventions
  return res.status(error.statusCode).json({
    success: false,
    message: response.message,
    errors: response.error, // Because ApiError uses `this.error` array
    ...(process.env.NODE_ENV === "development" ? { stack: response.stack } : {})
  });
};

export { errorHandler };
