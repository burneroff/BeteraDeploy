import { describe, it, expect, vi, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useLogout } from '@/shared/queries/auth/useLogout';

// mock logout() API
vi.mock('@/shared/api/auth/logout', () => ({
  logout: vi.fn(),
}));

// mock authStorage
vi.mock('@/shared/api/auth/authStorage', () => ({
  authStorage: {
    clear: vi.fn(),
  },
}));

import { logout } from '@/shared/api/auth/logout';
import { authStorage } from '@/shared/api/auth/authStorage';

// helper
function createWrapper() {
  const client = new QueryClient();
  const Wrapper = ({ children }: any) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('useLogout', () => {
  it('вызывает logout(), очищает authStorage и queryClient', async () => {
    (logout as Mock).mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(authStorage.clear).toHaveBeenCalledTimes(1);
    });
  });

  it('обрабатывает ошибку logout() и вызывает authStorage.clear()', async () => {
    (logout as Mock).mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(authStorage.clear).toHaveBeenCalledTimes(1);
    });
  });
});
