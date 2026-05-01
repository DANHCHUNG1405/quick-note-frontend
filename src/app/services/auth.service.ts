import { request } from "@/app/lib/api";
import { clearAccessToken } from "@/app/lib/authToken";
import { resetNotificationsSocket } from "@/app/lib/notificationsSocket";
import {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  CurrentUserData,
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
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
    }).finally(() => {
      clearAccessToken();
      resetNotificationsSocket();
    });
  },

  refresh(): Promise<{ message: string }> {
    return request("/auth/refresh", {
      method: "POST",
    });
  },

  me(): Promise<CurrentUserData> {
    return request<CurrentUserData>("/me");
  },
};
