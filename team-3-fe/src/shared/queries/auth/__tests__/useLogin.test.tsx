import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useLogin } from '../useLogin';
import { server } from '@/shared/lib/tests/mocks/server';
import { AllProviders } from '@/shared/lib/tests/test-utils';

const ABS = 'http://localhost:8080/api/v1/auth/login';
const REL = '/api/v1/auth/login';

describe('useLogin hook', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('успешный логин возвращает пользователя', async () => {
    // ВОЗВРАЩАЕМ axios-like ответ: { data: {...} }
    const successBody = {
      data: {
        accessToken: 'access123',
        refreshToken: 'refresh123',
        verified: true,
        user: { id: 13, email: 'test@mail.ru' },
      },
    };

    server.use(
      http.options(ABS, () => HttpResponse.json({}, { status: 200 })),
      http.post(ABS, () => HttpResponse.json(successBody)),
      http.options(REL, () => HttpResponse.json({}, { status: 200 })),
      http.post(REL, () => HttpResponse.json(successBody)),
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
    });

    await act(async () => {
      await result.current.mutateAsync({ email: 'test@mail.ru', password: '123123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.user.email).toBe('test@mail.ru');
  });

  it('ошибка логина выставляет isError', async () => {
 
    const errorBody = { data: { message: 'Invalid credentials' } };

    server.use(
      http.options(ABS, () => HttpResponse.json({}, { status: 200 })),
      http.post(ABS, () => HttpResponse.json(errorBody, { status: 401 })),
      http.options(REL, () => HttpResponse.json({}, { status: 200 })),
      http.post(REL, () => HttpResponse.json(errorBody, { status: 401 })),
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ email: 'bad@mail.ru', password: 'wrong' });
      } catch {
        // ожидаем падение мутации
      }
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
