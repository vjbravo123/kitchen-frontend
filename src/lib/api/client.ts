import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor for Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("kitchen_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; statusCode?: number }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // If token expired or invalid, clear token
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        // localStorage.removeItem("kitchen_token");
      }
    }

    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        errorMessage = error.response.data.message.join(", ");
      } else {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
