import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, User } from "@/lib/api";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password);
          const user = response.user || {
            id: response.id!,
            email: response.email!,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success("Welcome back!");
        } catch {
          set({ isLoading: false });
          throw new Error("Login failed");
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(email, password, name);
          const user = { id: response.id!, email: response.email! };
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success("Account created successfully!");
        } catch {
          set({ isLoading: false });
          throw new Error("Registration failed");
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
          set({ user: null, isAuthenticated: false });
          toast.success("Logged out successfully");
        } catch {
          // Still clear local state even if API call fails
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
