import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import("./authStore");
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original.url?.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const { useAuthStore } = await import("./authStore");
      const ok = await useAuthStore.getState().refresh();
      if (ok) {
        original.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);
