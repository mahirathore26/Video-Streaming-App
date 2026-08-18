import axios from "./axios";

export const getChannel = async (username) => {
  const response = await axios.get(`/users/c/${username}`, {
    withCredentials: true,
  });

  return response.data;
};

export const getWatchHistory = async () => {
  const response = await axios.get("/users/history", {
    withCredentials: true,
  });

  return response.data;
};

export const updateAccountDetails = async (data) => {
  const response = await axios.put("/users/update-account", data, {
    withCredentials: true,
  });
  return response.data;
};

export const updateUserAvatar = async (formData) => {
  const response = await axios.patch("/users/avatar", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateCoverImage = async (formData) => {
  const response = await axios.patch("/users/coverimage", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const changeCurrentPassword = async (data) => {
  const response = await axios.post("/users/change-password", data, {
    withCredentials: true,
  });
  return response.data;
};