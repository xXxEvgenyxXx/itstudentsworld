import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-cy' });

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