import axios from "./axios";

export const toggleVideoLike = async (videoId) => {
  const response = await axios.post(
    `/likes/video/${videoId}`,
    {},
    { withCredentials: true }
  );

  return response.data;
};

export const getVideoLikes = async (videoId) => {
  const response = await axios.get(
    `/likes/video/${videoId}/likes`,
    { withCredentials: true }
  );

  return response.data;
};

export const toggleCommentLike = async (commentId) => {
  const response = await axios.post(
    `/likes/comment/${commentId}`,
    {},
    { withCredentials: true }
  );

  return response.data;
};