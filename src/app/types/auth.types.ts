export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token?: string;
  user?: {
    id: string;
    email: string;
    fullname?: string | null;
  };
}

export interface CurrentUserData {
  userId: string;
  email: string;
  fullname?: string | null;
}
