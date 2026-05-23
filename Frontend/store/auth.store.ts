"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { authApi, apiErrorMessage } from "@/lib/api";
import { clearAuthCookie, setAuthCookie } from "@/lib/auth-cookie";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  Permission,
  SignupPayload,
} from "@/lib/types";

interface LogoutOptions {
  redirect?: boolean;
  callApi?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (payload: SignupPayload) => Promise<LoginResponse>;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: (options?: LogoutOptions) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  clearError: () => void;
  markHydrated: () => void;
}

export const getDefaultRouteForRole = (role?: string | null) =>
  role === "customer" ? "/" : "/dashboard";

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  const nextPath =
    window.location.pathname.startsWith("/dashboard") ||
    window.location.pathname.startsWith("/account")
      ? `?next=${encodeURIComponent(window.location.pathname)}`
      : "";

  window.location.href = `/login${nextPath}`;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,

      signup: async (payload) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await authApi.signup(payload);

          set({
            user: response.user,
            token: response.token,
            permissions: response.permissions,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          setAuthCookie(response.token, response.user.role);
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: apiErrorMessage(error),
          });

          throw error;
        }
      },

      login: async (payload) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await authApi.login(payload);

          set({
            user: response.user,
            token: response.token,
            permissions: response.permissions,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          setAuthCookie(response.token, response.user.role);
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: apiErrorMessage(error),
          });

          throw error;
        }
      },

      logout: async (options = {}) => {
        const { redirect = false, callApi = true } = options;

        set({
          isLoading: true,
          error: null,
        });

        try {
          if (callApi) {
            await authApi.logout();
          }
        } catch {
          // Best effort logout. Local auth state is still cleared below.
        } finally {
          clearAuthCookie();
          set({
            user: null,
            token: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          if (redirect) {
            redirectToLogin();
          }
        }
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),

      setPermissions: (permissions) =>
        set({
          permissions,
        }),

      clearError: () =>
        set({
          error: null,
        }),

      markHydrated: () =>
        set({
          isHydrated: true,
        }),
    }),
    {
      name: "trend-sole-admin-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthCookie(state.token, state.user?.role);
        }

        state?.markHydrated();
      },
    }
  )
);
