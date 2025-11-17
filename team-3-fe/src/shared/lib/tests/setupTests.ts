import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// запуск MSW один раз
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// опционально: приглушить react warnings
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args?.[0];
  if (typeof msg === 'string' && msg.includes('Warning:')) return;
  // @ts-ignore
  originalError(...args);
};

// моки статики
vi.mock('.*\\.(svg|png|jpg)$', () => ({ default: 'test-file-stub' }));
vi.mock('.*\\.(css|scss)$', () => ({}));
