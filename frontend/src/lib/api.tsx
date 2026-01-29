import axios from "axios";

// FIXED: Use Vite's environment variable syntax
// Fallback to localhost:8000 if not set. 
// We assume the Django project urls.py includes the api app at 'api/'
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// We keep the interceptor in case you add auth back later, 
// but since the endpoint is AllowAny, it won't block if token is missing.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const transportService = {
  create: async (payload: any) => {
    // FIXED: Django is strict about trailing slashes. 
    // If your backend lists 'transports/create/', we must match it exactly.
    const response = await api.post("/transports/create/", payload);
    return response.data;
  },
};
