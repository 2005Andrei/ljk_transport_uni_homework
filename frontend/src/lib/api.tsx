import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://andrewshort.pythonanywhere.com/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    const response = await api.post("/transports/create/", payload);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/transports/");
    return response.data;
  },
  
  get: async (id: number) => { 
    const response = await api.get(`/transports/${id}/`);
    return response.data;
  },

  mark_as_delivered: async (id: number) => {
    const response = await api.patch(`/transports/${id}/update/`, {
      status: 0
    });
    return response.data;
  }
};
