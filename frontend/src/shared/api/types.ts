/**
 * Стандартный формат ошибки Laravel.
 * Пример ответа 422:
 * { message: "The email field is required.", errors: { email: ["..."] } }
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Ответ с пагинацией Laravel (paginate()).
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Успешный ответ с простым сообщением.
 */
export interface MessageResponse {
  message: string;
}

/**
 * Параметры пагинации/фильтрации — базовые.
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
