import axios from "./axios";

export const getVideos = async (query = "") => {
  const url = query ? `/videos?query=${encodeURIComponent(query)}` : "/videos";
  const response = await axios.get(url, {
    withCredentials: true,
  });

  return response.data;
};
export const getChannelVideos = async (userId) => {
  const response = await axios.get(`/videos?userId=${userId}`, {
    withCredentials: true,
  });

  return response.data;
};
export const getVideo = async (videoId) => {
  const response = await axios.get(`/videos/${videoId}`, {
    withCredentials: true,
  });

  return response.data;
};
export const getMyVideos = async () => {
  const response = await axios.get("/dashboard/videos", {
    withCredentials: true,
  });

  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await axios.delete(`/videos/${videoId}`, {
    withCredentials: true,
  });

  return response.data;
};

export const togglePublish = async (videoId) => {
  const response = await axios.patch(
    `/videos/toggle/publish/${videoId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};
export const uploadVideo = async (formData) => {
  const response = await axios.post(
    "/videos",
    formData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateVideo = async (videoId, formData) => {
  const response = await axios.patch(
    `/videos/${videoId}`,
    formData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};