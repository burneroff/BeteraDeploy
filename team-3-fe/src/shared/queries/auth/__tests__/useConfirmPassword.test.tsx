// src/shared/queries/auth/__tests__/useConfirmPassword.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
 
import { authStorage } from '@/shared/api/auth/authStorage';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { server } from '@/shared/lib/tests/mocks/server';
import { useConfirmPassword } from '../useConfirmPassword';

// notify mock
vi.mock('@/app/providers/NotificationProvider/notificationService', () => ({
  notify: vi.fn(),
}));

// authStorage mock
vi.mock('@/shared/api/auth/authStorage', () => ({
  authStorage: {
    getAccessToken: vi.fn().mockReturnValue(null),
    getRefreshToken: vi.fn().mockReturnValue(null),
    saveTokens: vi.fn(),
    clear: vi.fn(),
  },
}));

function wrapper({ children }: any) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useConfirmPassword', () => {
  const URL = /\/api\/v1\/auth\/confirm$/;

  it('успешно подтверждает пароль и сохраняет токены', async () => {
    server.use(
      http.post(URL, () =>
        HttpResponse.json({
          success: true,
          data: {
            accessToken: 'access123',
            refreshToken: 'refresh123',
          },
        })
      )
    );

    const { result } = renderHook(() => useConfirmPassword(), { wrapper });

    result.current.mutate({
      user_id: 10,
      token: 'abc',
      password: '123123',
    });

    await waitFor(() =>
      expect(authStorage.saveTokens).toHaveBeenCalledWith(
        'access123',
        'refresh123'
      )
    );

    expect(notify).toHaveBeenCalledWith({
      message: 'Пароль сохранён. Добро пожаловать!',
      severity: 'success',
    });
  });

  it('ошибка подтверждения вызывает notify(error)', async () => {
    server.use(
      http.post(URL, () =>
        HttpResponse.json({ message: 'Invalid token' }, { status: 400 })
      )
    );

    const { result } = renderHook(() => useConfirmPassword(), { wrapper });

    result.current.mutate({
      user_id: 10,
      token: 'wrong',
      password: '123123',
    });

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith({
        message: 'Invalid token',
        severity: 'error',
      })
    );
  });
});
