import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "/api";
export const STORAGE_URL: string = import.meta.env.VITE_STORAGE_URL ?? "/storage";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 419) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.warn("Sesión expirada. Por favor, inicia sesión nuevamente.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function get<T = unknown>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T | null> {
  try {
    const response = await api.get<T>(endpoint, config);
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", (error as Error).message);
      return null;
    }
    console.error("Error en GET:", error);
    throw error;
  }
}

export async function post<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const config: AxiosRequestConfig = {};
  if (data instanceof FormData) {
    config.headers = { "Content-Type": "multipart/form-data" };
  }
  const response = await api.post<T>(endpoint, data, config);
  return response.data;
}

export async function put<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const config: AxiosRequestConfig = {};
  if (data instanceof FormData) {
    config.headers = { "Content-Type": "multipart/form-data" };
  }
  const response = await api.put<T>(endpoint, data, config);
  return response.data;
}

export async function del<T = unknown>(endpoint: string): Promise<T> {
  const response = await api.delete<T>(endpoint);
  return response.data;
}

export default api;
