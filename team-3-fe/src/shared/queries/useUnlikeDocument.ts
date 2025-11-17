import { useMutation } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { unLikeDocument } from '@/shared/api/likes/unlikeDocument.ts';

export function useUnLikeDocument() {
  return useMutation<void, Error, number>({
    mutationFn: unLikeDocument,
    onSuccess: () => {
      notify({ message: 'Лайк убран', severity: 'success' });
    },
    onError: (error) => {
      notify({
        message: error.message || 'Не удалось убрать лайк',
        severity: 'error',
      });
    },
  });
}
