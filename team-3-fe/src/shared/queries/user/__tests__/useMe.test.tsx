import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '@/shared/lib/tests/mocks/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMe } from '@/shared/queries/user/useMe';

vi.mock('@/shared/api/auth/authStorage', () => ({
  authStorage: { getAccessToken: vi.fn(() => 'bearer-token') },
}));

const ME_URL = '*/api/v1/user/me';

function TestProviders({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

afterEach(() => {
  server.resetHandlers();
});

describe('useMe', () => {
  it('успешно возвращает me', async () => {
    const me = { id: 13, email: 'test@mail.ru', role_id: 1, initials: '' };

    server.use(
      mswHttp.options(ME_URL, () => new HttpResponse(null, { status: 204 })),
      mswHttp.get(ME_URL, () => HttpResponse.json({ data: me }, { status: 200 })),
    );

    const { result } = renderHook(() => useMe(), { wrapper: TestProviders });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.isError).toBe(false);
    expect(result.current.user).toEqual(me);
  });

  it('при 401 выставляет isError', async () => {
    server.use(
      mswHttp.options(ME_URL, () => new HttpResponse(null, { status: 204 })),
      mswHttp.get(ME_URL, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useMe(), { wrapper: TestProviders });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.isError).toBe(true);
    expect(result.current.user).toBeFalsy();
  });
});
