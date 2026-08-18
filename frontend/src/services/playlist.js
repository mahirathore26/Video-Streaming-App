import axios from "./axios";

export const createPlaylist = async (data) => {
  const response = await axios.post("/playlists", data, {
    withCredentials: true,
  });

  return response.data;
};

export const getPlaylists = async (userId) => {
  const response = await axios.get(`/playlists/user/${userId}`, {
    withCredentials: true,
  });

  return response.data;
};

export const getPlaylist = async (playlistId) => {
  const response = await axios.get(`/playlists/${playlistId}`, {
    withCredentials: true,
  });

  return response.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await axios.delete(`/playlists/${playlistId}`, {
    withCredentials: true,
  });

  return response.data;
};

export const addVideo = async (playlistId, videoId) => {
  const response = await axios.post(
    `/playlists/${playlistId}/video/${videoId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const removeVideo = async (playlistId, videoId) => {
  const response = await axios.delete(
    `/playlists/${playlistId}/video/${videoId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const addArticle = async (playlistId, articleId) => {
  const response = await axios.post(
    `/playlists/${playlistId}/article/${articleId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const removeArticle = async (playlistId, articleId) => {
  const response = await axios.delete(
    `/playlists/${playlistId}/article/${articleId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updatePlaylist = async (playlistId, data) => {
  const response = await axios.patch(
    `/playlists/${playlistId}`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};