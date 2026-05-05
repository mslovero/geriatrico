import axios from "axios";

// 🔹 URL base de tu backend Laravel
export const API_URL = import.meta.env.VITE_API_URL || "/api";
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "/storage";

// 🔹 Instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request interceptor - Añadir token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔐 Response interceptor - Manejar tokens expirados y errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  (error) => {
    // Si el error es 401 (No autenticado) o 419 (Token expirado)
    if (error.response && (error.response.status === 401 || error.response.status === 419)) {
      // Limpiar el token del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Mostrar mensaje al usuario
      console.warn('⚠️ Sesión expirada. Por favor, inicia sesión nuevamente.');

      // Redirigir al login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const get = async (endpoint, config = {}) => {
  try {
    const response = await api.get(endpoint, config);
    return response.data;
  } catch (error) {
    // Si el error es una cancelación, no lo logueamos como error
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
      return null;
    }
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
