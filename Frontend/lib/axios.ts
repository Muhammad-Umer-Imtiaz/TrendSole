import axios from "axios";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "@/lib/auth-cookie";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "";

if (!baseURL) {
  // Keep runtime signal explicit for missing config in production environments.
  // The actual requests will still surface this if the app renders before env setup.
  console.warn(
    "NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BACKEND_URL is missing. Admin API requests will fail."
  );
}

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import("@/store/auth.store");
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const { useAuthStore } = await import("@/store/auth.store");
      useAuthStore.getState().logout({ redirect: true, callApi: false });
      clearAuthCookie();
      document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict`;
    }

    return Promise.reject(error);
  }
);
