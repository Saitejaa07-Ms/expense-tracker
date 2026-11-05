import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("accessToken");

      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
