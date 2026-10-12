import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../config";
import { parseApiError } from "./errors";
import { emitUnauthorized } from "./events";

/**
 * Ключ, под которым токен хранится в localStorage.
 * Экспортируем — чтобы entities/user использовал то же имя.
 */
export const AUTH_TOKEN_KEY = "itsw_token";

/**
 * Основной axios-инстанс.
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Подставляет токен из localStorage в каждый запрос.
 *
 * Почему localStorage, а не Zustand-стор?
 * - Shared не может импортировать entities (FSD).
 * - localStorage — общий источник, который синхронизирует Zustand-стор через persist.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * Ловит ошибки и превращает их в ApiException.
 * При 401 — эмитит событие.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 — эмитим событие (обрабатывается в app/providers)
    if (error.response?.status === 401) {
      emitUnauthorized();
    }

    // Превращаем в наш ApiException и реджектим дальше
    return Promise.reject(parseApiError(error));
  },
);
