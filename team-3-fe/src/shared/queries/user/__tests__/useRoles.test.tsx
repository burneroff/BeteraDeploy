import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '@/shared/lib/tests/mocks/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRoles } from '../useRoles';

const ROLES_URL = '*/api/v1/roles/getall';
const REFRESH_URL = '*/api/v1/auth/refresh';

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
}

function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createClient()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  server.use(mswHttp.post(REFRESH_URL, () => new HttpResponse(null, { status: 401 })));
});

afterEach(() => {
  server.resetHandlers();
});

describe('useRoles', () => {
  it('успешно возвращает список ролей', async () => {
    const roles = [{ id: 1, name: 'Администратор' }];

    server.use(
      mswHttp.options(ROLES_URL, () => new HttpResponse(null, { status: 204 })),
      mswHttp.get(ROLES_URL, () => HttpResponse.json(roles, { status: 200 })),
    );

    const { result } = renderHook(() => useRoles(), { wrapper: Providers });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(roles);
  });
});
