import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-cy' });

const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt) => originalGetComputedStyle(elt);

const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = String(args[0]);
  if (
    msg.includes("Not implemented: Window's getComputedStyle()") ||
    msg.includes("Warning: [antd:")
  ) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = String(args[0]);
  if (msg.includes("Warning: [antd:")) {
    return;
  }
  originalWarn(...args);
};

const originalLog = console.log;
console.log = (...args: unknown[]) => {
  const msg = String(args[0]);
  if (msg.includes("Ошибка валидации формы:")) {
    return;
  }
  originalLog(...args);
};

// Мок для window.matchMedia, который отсутствует в jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // По умолчанию считаем, что ни одно медиа-условие не выполняется
    media: query,
    onchange: null,
    addListener: vi.fn(), // Устаревший метод (для совместимости)
    removeListener: vi.fn(), // Устаревший метод
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});