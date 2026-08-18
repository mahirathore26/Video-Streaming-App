import axios from "./axios";

export const logout = async () => {
  const response = await axios.post(
    "/users/logout",
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};