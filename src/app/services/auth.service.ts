import { request } from "@/app/lib/api";
import {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "@/app/types/auth.types";

export const authService = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout(): Promise<{ message: string }> {
    return request("/auth/logout", {
      method: "POST",
    });
  },

  refresh(): Promise<{ message: string }> {
    return request("/auth/refresh", {
      method: "POST",
    });
  },
};
