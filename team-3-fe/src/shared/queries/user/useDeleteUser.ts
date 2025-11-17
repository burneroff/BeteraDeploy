import { useMutation } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { deleteUserAccount } from '@/shared/api/users/deleteUser.ts';

export const useDeleteUser = () => {
  // const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteUserAccount(id),

    onSuccess: async () => {
      notify({ message: 'Пользователь удалён', severity: 'success' });
    },

    onError: (err: any) => {
      notify({
        message: err?.response?.data?.message || err?.message || 'Ошибка удаления',
        severity: 'error',
      });
    },
  });
};
