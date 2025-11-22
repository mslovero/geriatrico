import axios from "axios";

// 🔹 URL base de tu backend Laravel
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// 🔹 Instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const get = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("❌ Error en GET:", error);
    throw error;
  }
};

export const post = async (endpoint, data) => {
  try {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    const response = await api.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error en POST:", error);
    throw error;
  }
};

export const put = async (endpoint, data) => {
  try {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    const response = await api.put(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error en PUT:", error);
    throw error;
  }
};

export const del = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error("❌ Error en DELETE:", error);
    throw error;
  }
};
