import axios from "./axios";

export const getExploreFeed = async (query = "") => {
  const url = query ? `/feed/explore?query=${encodeURIComponent(query)}` : "/feed/explore";
  const response = await axios.get(url, {
    withCredentials: true,
  });
  return response.data;
};

export const getSubscriptionFeed = async () => {
  const response = await axios.get("/feed/subscriptions", {
    withCredentials: true,
  });
  return response.data;
};
