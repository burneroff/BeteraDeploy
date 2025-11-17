import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authStorage } from '@/shared/api/auth/authStorage';
import { logout } from '@/shared/api/auth/logout';
 

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSettled: async () => {
      authStorage.clear();
      queryClient.clear();
    },
  });
};
