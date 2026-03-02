import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false, // no cookies anymore
});

const ALLOWED_ROLES = ["admin", "super_admin"];

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await api.post("/auth/login", { email, password });

          if (!ALLOWED_ROLES.includes(data.user.role)) {
            set({ error: "Access restricted to admins only", isLoading: false });
            return false;
          }

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
            isLoading: false,
          });

          return true;
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? "Login failed",
            isLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        const { accessToken, refreshToken } = get();
        set({ accessToken: null, refreshToken: null, user: null }); // clear first
        try {
          await api.post(
            "/auth/logout",
            { refreshToken },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
        } catch {
          // already cleared, nothing to do
        }
      },

      refresh: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;
        try {
          const { data } = await api.post("/auth/refresh", { refreshToken });
          const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
          set({ accessToken: data.accessToken, user: payload.user });
          return true;
        } catch {
          set({ accessToken: null, refreshToken: null, user: null });
          return false;
        }
      },
    }),
    {
      name: "auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken, // persist it so refresh survives page reload
        user: s.user,
      }),
    },
  ),
);

// Axios interceptor — auto-attach token + auto-refresh on 401
api.interceptors.request.use((config) => {
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
      const ok = await useAuthStore.getState().refresh();
      if (ok) {
        original.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export { api };
