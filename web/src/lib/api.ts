import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// TypeScript interfaces for API responses
export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  id?: number;
  email?: string;
}

export interface ActionItem {
  owner?: string;
  task: string;
  due?: string;
}

export interface Meeting {
  id: number;
  title: string;
  audioPath?: string;
  transcript?: string;
  summary?: string;
  actionItems?: ActionItem[];
  decisions?: string[];
  createdAt: string;
  updatedAt: string;
  ownerId?: number;
}

export interface MeetingsResponse {
  items: Meeting[];
}

export interface MeetingResponse {
  item: Meeting;
  message?: string;
}

export interface UploadResponse {
  ok: boolean;
  audioPath: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

export interface ApiKeyStatus {
  saved: boolean;
  provider: "openai" | "gemini" | null;
  model: string | null;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const message =
      error.response?.data?.error || "An unexpected error occurred";

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Only show toast if not already on login page
      if (!window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
    } else {
      // Show error toast for other errors
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: async (
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/register", {
      email,
      password,
      name,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },
};

// Meetings API
export const meetingsApi = {
  getAll: async (): Promise<Meeting[]> => {
    const { data } = await api.get<MeetingsResponse>("/api/meetings");
    return data.items;
  },

  getById: async (id: number): Promise<Meeting> => {
    const { data } = await api.get<MeetingResponse>(`/api/meetings/${id}`);
    return data.item;
  },

  create: async (title: string): Promise<Meeting> => {
    const { data } = await api.post<MeetingResponse>("/api/meetings", {
      title,
    });
    return data.item;
  },

  uploadAudio: async (
    id: number,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("audio", file);

    const { data } = await api.post<UploadResponse>(
      `/api/meetings/${id}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        },
      },
    );
    return data;
  },

  process: async (id: number): Promise<Meeting> => {
    const { data } = await api.post<MeetingResponse>(
      `/api/meetings/${id}/process`,
    );
    return data.item;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/meetings/${id}`);
  },
};

// API Key Management API
export const apiKeyApi = {
  getStatus: async (): Promise<ApiKeyStatus> => {
    const { data } = await api.get<ApiKeyStatus>("/api/user/api-key/status");
    return data;
  },

  save: async (
    key: string,
    provider: "openai" | "gemini",
    model: string,
  ): Promise<void> => {
    await api.put("/api/user/api-key", { key, provider, model });
  },

  remove: async (): Promise<void> => {
    await api.delete("/api/user/api-key");
  },
};

export default api;
