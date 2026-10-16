import { api, API } from '@/shared/api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../model';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API.auth.register, payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API.auth.login, payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post(API.auth.logout);
  },

  fetchMe: async (): Promise<User> => {
    const { data } = await api.get<User>(API.auth.me);
    return data;
  },
};