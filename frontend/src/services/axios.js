import axios from "axios";

const api = axios.create({
    // Retrieve the API URL from environment variables, fallback to local dev
    baseURL: import.meta.env.VITE_API_URL || "https://odyssey-51g8.onrender.com/api/v1",
    withCredentials: true,
});

export default api;