export interface Role {
  id: number;
  name: string;
  alias: "user" | "admin" | "owner";
}

export interface Wallet {
  user_id: number;
  balance: string; // Laravel decimal приходит строкой - поэтому string
}

export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string | null;
  email: string;
  login: string;
  is_banned: boolean;
  created_at: string;
  role: Role;
  wallet: Wallet;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  surname: string;
  patronymic?: string | null;
  email: string;
  login: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  surname?: string;
  patronymic?: string | null;
  email?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
