import axios from "./axios";

export const getPublicArticles = async (query = "") => {
  const url = query ? `/articles?query=${encodeURIComponent(query)}` : "/articles";
  const response = await axios.get(url, {
    withCredentials: true,
  });
  return response.data;
};

export const getAuthorArticles = async (authorId) => {
  const response = await axios.get(`/articles?authorId=${authorId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const getArticle = async (articleId) => {
  const response = await axios.get(`/articles/${articleId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const getMyArticles = async (filter = "") => {
  const url = filter ? `/articles/my-articles?filter=${filter}` : "/articles/my-articles";
  const response = await axios.get(url, {
    withCredentials: true,
  });
  return response.data;
};

export const getBookmarkedArticles = async () => {
  const response = await axios.get("/articles/bookmarked", {
    withCredentials: true,
  });
  return response.data;
};

export const createArticle = async (formData) => {
  const response = await axios.post("/articles", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const updateArticle = async (articleId, formData) => {
  const response = await axios.patch(`/articles/${articleId}`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const deleteArticle = async (articleId) => {
  const response = await axios.delete(`/articles/${articleId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const togglePublishArticle = async (articleId) => {
  const response = await axios.patch(`/articles/toggle/publish/${articleId}`, {}, {
    withCredentials: true,
  });
  return response.data;
};

export const toggleBookmarkArticle = async (articleId) => {
  const response = await axios.patch(`/articles/toggle/bookmark/${articleId}`, {}, {
    withCredentials: true,
  });
  return response.data;
};

export const getArticleSummary = async (articleId) => {
  const response = await axios.get(`/articles/${articleId}/summary`, {
    withCredentials: true,
  });
  return response.data;
};
