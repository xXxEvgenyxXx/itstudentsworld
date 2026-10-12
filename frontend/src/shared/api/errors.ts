import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "./types";

/**
 * Кастомный класс ошибки API — удобно ловить в компонентах.
 */
export class ApiException extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiException";
  }

  /**
   * Получить первую ошибку по конкретному полю.
   */
  getFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

/**
 * Превращает любую ошибку axios в ApiException с понятным сообщением.
 */
export function parseApiError(error: unknown): ApiException {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;

    // Laravel вернул структурированную ошибку
    if (data?.message) {
      return new ApiException(data.message, status, data.errors);
    }

    // Сеть упала или таймаут
    if (!axiosError.response) {
      return new ApiException(
        "Не удалось соединиться с сервером. Проверьте интернет.",
        0,
      );
    }

    // Что-то другое (500, 502 и т.п.)
    return new ApiException(`Ошибка сервера (${status})`, status);
  }

  // Не axios-ошибка — что-то упало в JS
  if (error instanceof Error) {
    return new ApiException(error.message, 0);
  }

  return new ApiException("Неизвестная ошибка", 0);
}

/**
 * Утилита для маппинга ошибок Laravel в поля формы.
 * Используется в react-hook-form / AntD Form.
 */
export function mapApiErrorsToFields(
  error: ApiException,
): Record<string, string> {
  if (!error.errors) return {};

  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.errors)) {
    result[field] = messages[0]; // берём первое сообщение
  }
  return result;
}
