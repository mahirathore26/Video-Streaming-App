import axios from "./axios";

export const getStats = async () => {
  const response = await axios.get("/dashboard/stats", {
    withCredentials: true,
  });

  return response.data;
};

// Removed duplicate getChannelVideos (which queried /dashboard/videos). Use getMyVideos from services/video.js instead.