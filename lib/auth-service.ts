import { ApiClient } from "./api-client";
import type { User, ApiResponse } from "./types";

const apiClient = new ApiClient();

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; token: string }>
    >("/auth/login", {
      email,
      password,
    });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data || { user: {} as User, token: "" };
  },

  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; token: string }>
    >("/auth/signup", {
      email,
      password,
      name,
    });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data || { user: {} as User, token: "" };
  },

  async logout(): Promise<void> {
    apiClient.clearToken();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      return response.data || null;
    } catch {
      return null;
    }
  },
};
