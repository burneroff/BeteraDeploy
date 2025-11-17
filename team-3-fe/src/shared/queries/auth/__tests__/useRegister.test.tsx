// src/shared/queries/auth/__tests__/useRegister.test.tsx
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '@/shared/lib/tests/mocks/server';
import { AllProviders } from '@/shared/lib/tests/test-utils';
import { useRegister, type RegisterPayload } from '@/shared/queries/auth/useRegister';

// мок уведомлений
vi.mock('@/app/providers/NotificationProvider/notificationService', () => ({
  notify: vi.fn(),
}));

// клиентский axios интерцептор дергает storage — подложим заглушку
vi.mock('@/shared/api/auth/authStorage', () => ({
  authStorage: {
    getAccessToken: vi.fn(() => ''), // чтобы не подставлялся Bearer
  },
}));

const ABS_URL = 'http://localhost:8080/api/v1/auth/register';
const REL_URL = '/api/v1/auth/register';

// важно импортировать после mock'ов
const { notify } = await import('@/app/providers/NotificationProvider/notificationService');

describe('useRegister', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('успешно регистрирует и вызывает notify(success)', async () => {
    server.use(
      // preflight для axios (OPTIONS) на оба URL
      mswHttp.options(ABS_URL, () => HttpResponse.json({}, { status: 200 })),
      mswHttp.options(REL_URL, () => HttpResponse.json({}, { status: 200 })),

      // ABS handler
      mswHttp.post(ABS_URL, async ({ request }) => {
        const body = (await request.json()) as RegisterPayload | null;
        if (!body || typeof body.role_id !== 'number') {
          return HttpResponse.json({ message: 'Bad payload' }, { status: 400 });
        }
        return HttpResponse.json({
          data: {
            accessToken: 'test1123',
            refreshToken: 'teset3324',
            verified: false,
            user: { id: 1, email: body.email },
          },
        });
      }),

      // REL handler
      mswHttp.post(REL_URL, async ({ request }) => {
        const body = (await request.json()) as RegisterPayload | null;
        if (!body || typeof body.role_id !== 'number') {
          return HttpResponse.json({ message: 'Bad payload' }, { status: 400 });
        }
        return HttpResponse.json({
          data: {
            accessToken: 'a',
            refreshToken: 'r',
            verified: false,
            user: { id: 1, email: body.email },
          },
        });
      }),
    );

    const { result } = renderHook(() => useRegister(), {
      wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
    });

    await act(async () => {
      await result.current.mutateAsync({
        first_name: 'test',
        last_name: 'test',
        email: 'test@test.com',
        role_id: 2 as any,  
      });
    });

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith({
        message: 'Пользователь успешно зарегистрирован',
        severity: 'success',
      });
    });
  });

  it('ошибка регистрации вызывает notify(error)', async () => {
    server.use(
      mswHttp.options(ABS_URL, () => HttpResponse.json({}, { status: 200 })),
      mswHttp.options(REL_URL, () => HttpResponse.json({}, { status: 200 })),
      mswHttp.post(ABS_URL, async () =>
        HttpResponse.json({ message: 'Email already used' }, { status: 409 }),
      ),
      mswHttp.post(REL_URL, async () =>
        HttpResponse.json({ message: 'Email already used' }, { status: 409 }),
      ),
    );

    const { result } = renderHook(() => useRegister(), {
      wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
    });

    await act(async () => {
      await result.current
        .mutateAsync({
          first_name: 'A',
          last_name: 'B',
          email: 'a@b.com',
          role_id: 2,
        })
        .catch(() => {});
    });

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith({
        message: 'Email already used',
        severity: 'error',
      });
    });
  });
});
