import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { markViewed } from '@/shared/api/views/markViewed.ts';

export function useMarkViewed() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: markViewed,
    onSuccess: (_, documentId) => {
      notify({ message: 'Документ ознакомлен', severity: 'success' });

      // После успешного ознакомления — обновляем viewers и views-count
      queryClient.invalidateQueries({ queryKey: ['viewers', documentId] });
      queryClient.invalidateQueries({ queryKey: ['views-count', documentId] });
    },
    onError: (error) => {
      notify({
        message: error.message || 'Не удалось ознакомиться',
        severity: 'error',
      });
    },
  });
}
