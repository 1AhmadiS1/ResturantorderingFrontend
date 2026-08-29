import axios from "axios";
import { API_BASE_URL } from "../config";
import { authStorage } from "./authStorage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = authStorage.getRefreshToken();
    const isAuthRequest = request?.url?.includes("/token/");

    if (error.response?.status !== 401 || request?._retried || !refreshToken || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      refreshPromise ||= axios
        .post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken })
        .then(({ data }) => {
          authStorage.setTokens({ access: data.access });
          return data.access;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const accessToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(request);
    } catch (refreshError) {
      authStorage.clear();
      window.dispatchEvent(new Event("restohub:session-expired"));
      return Promise.reject(refreshError);
    }
  },
);

export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstEntry = Object.entries(data)[0];
  if (!firstEntry) return fallback;
  const [field, value] = firstEntry;
  const message = Array.isArray(value) ? value[0] : value;
  if (typeof message === "object") return JSON.stringify(message);
  return `${field.replaceAll("_", " ")}: ${message}`;
}

export async function getCollection(path, params = {}) {
  const { data } = await apiClient.get(path, { params });
  return Array.isArray(data) ? { count: data.length, results: data } : data;
}

