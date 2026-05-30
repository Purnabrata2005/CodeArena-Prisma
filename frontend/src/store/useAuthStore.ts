import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { LoginData, SignupData, UpdateUserProfileValues } from "../lib/schemas/authSchema";
import type { AuthUser } from "../types/index";
import { getErrorMessage } from "@/lib/utils";
import { authClient } from "../lib/auth-client";

interface AuthState {
  authUser: AuthUser | null;
  isSigninUp: boolean;
  isLoggingIn: boolean;
  isFetchingUser: boolean;
  isAuthenticated: boolean;
  isUpdatingUser: boolean;
  getCurrentUser: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateUserProfileValues) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authUser: null,
      isSigninUp: false,
      isLoggingIn: false,
      isFetchingUser: true,
      isAuthenticated: false,
      isUpdatingUser: false,

      getCurrentUser: async () => {
        set({ isFetchingUser: true });
        try {
          const { data: session, error } = await authClient.getSession();
          if (error || !session) {
            set({ authUser: null, isAuthenticated: false });
            return;
          }
          
          const rawUser = session.user as any;
          set({
            authUser: {
              id: rawUser.id,
              name: rawUser.name,
              email: rawUser.email,
              username: rawUser.username,
              avatarUrl: rawUser.image || rawUser.avatarUrl,
              avatarLocalPath: rawUser.avatarLocalPath,
              bio: rawUser.bio,
              role: (rawUser.role as "ADMIN" | "USER") || "USER",
            },
            isAuthenticated: true,
          });
        } catch (error) {
          console.log(error);
          set({ authUser: null, isAuthenticated: false });
        } finally {
          set({ isFetchingUser: false });
        }
      },

      signup: async (data) => {
        set({ isSigninUp: true });
        try {
          const { error } = await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            callbackURL: window.location.origin + "/login?verified=true",
          });
          if (error) {
            throw new Error(error.message);
          }
          toast.success("Registration successful! Please check your email to verify.");
        } catch (error) {
          toast.error(getErrorMessage(error));
          throw error;
        } finally {
          set({ isSigninUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const { data: result, error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
          });
          if (error) {
            throw new Error(error.message);
          }
          if (result) {
            const rawUser = result.user as any;
            set({
              authUser: {
                id: rawUser.id,
                name: rawUser.name,
                email: rawUser.email,
                username: rawUser.username,
                avatarUrl: rawUser.image || rawUser.avatarUrl,
                avatarLocalPath: rawUser.avatarLocalPath,
                bio: rawUser.bio,
                role: (rawUser.role as "ADMIN" | "USER") || "USER",
              },
              isAuthenticated: true,
            });
            toast.success("Logged in successfully");
          }
        } catch (error) {
          toast.error(getErrorMessage(error));
          throw error;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          const { error } = await authClient.signOut();
          if (error) {
            throw new Error(error.message);
          }
          set({ authUser: null, isAuthenticated: false });
          toast.success("Logout successful");
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingUser: true });
        try {
          const res = (
            await axiosInstance.patch("/auth/update", data, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          ).data;
          set({
            authUser: {
              id: res.data.user.id,
              name: res.data.user.name,
              email: res.data.user.email,
              username: res.data.user.username,
              avatarUrl: res.data.user.avatarUrl,
              avatarLocalPath: res.data.user.avatarLocalPath,
              bio: res.data.user.bio,
              role: res.data.user.role as "ADMIN" | "USER",
            },
            isAuthenticated: true,
          });
          toast.success(res.message);
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          set({ isUpdatingUser: false });
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);