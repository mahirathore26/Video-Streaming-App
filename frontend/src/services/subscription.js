import axios from "./axios";

export const toggleSubscription = async (channelId) => {
  const response = await axios.post(
    `/subscriptions/${channelId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getSubscribers = async (channelId) => {
  const response = await axios.get(
    `/subscriptions/channel/${channelId}/subscribers`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};