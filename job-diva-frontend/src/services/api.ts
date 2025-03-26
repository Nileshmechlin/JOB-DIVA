import axios from "axios";
import { store } from "../store";
import {
  logoutUser,
  refreshToken as refreshTokenAction,
} from "../features/auth/authSlice";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Attach Authorization Token to Requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 Errors and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Just call refreshToken API (cookie handles refresh token)
        const resultAction = await store.dispatch(refreshTokenAction());

        if (refreshTokenAction.fulfilled.match(resultAction)) {
          const newToken = resultAction.payload.accessToken;
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); // Retry original request
        } else {
          store.dispatch(logoutUser());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth API Endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post("/auth/signup", userData),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
};

// ✅ LinkedIn API Endpoints
export const linkedInAPI = {
  getStatus: () => api.get("/linkedin/status"),
  connect: () => {
    // Redirect to LinkedIn auth endpoint
    window.location.href = `${BASE_URL}/linkedin/auth`;
    return Promise.resolve(); // Return promise for consistency
  },
  handleCallback: (code: string) => api.get(`/linkedin/callback?code=${code}`),
  postJob: (jobData: {
    title: string;
    description: string;
    companyName: string;
    location: string;
    applyLink: string;
  }) => api.post("/linkedin/post-job", jobData),
};

export default api;
