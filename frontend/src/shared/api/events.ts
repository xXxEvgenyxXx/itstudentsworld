export const API_EVENTS = {
  UNAUTHORIZED: "api:unauthorized",
} as const;

/**
 * Вызывается, когда сервер вернул 401.
 * Слушатель — в app/providers/AuthProvider (или отдельный ApiListener).
 */
export function emitUnauthorized(): void {
  window.dispatchEvent(new CustomEvent(API_EVENTS.UNAUTHORIZED));
}

/**
 * Подписка на событие 401.
 * Возвращает функцию отписки.
 */
export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(API_EVENTS.UNAUTHORIZED, handler);
  return () => window.removeEventListener(API_EVENTS.UNAUTHORIZED, handler);
}
