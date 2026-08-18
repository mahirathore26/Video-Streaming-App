import axios from "./axios";

export const getComments = async (videoId, page = 1, limit = 10) => {
  const response = await axios.get(
    `/comments/${videoId}?page=${page}&limit=${limit}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const createComment = async (videoId, content) => {
  const response = await axios.post(
    `/comments/${videoId}`,
    { content },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await axios.patch(
    `/comments/${commentId}`,
    { content },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(
    `/comments/${commentId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};