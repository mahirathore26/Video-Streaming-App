import axios from "./axios";

export const login = async (data) => {
  const response = await axios.post("/users/login", data, {
    withCredentials: true,
  });

  return response.data;
};

export const register = async (formData) => {
  const response = await axios.post(
    "/users/register",
    formData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get("/users/user-profile", {
    withCredentials: true,
  });

  return response.data;
};