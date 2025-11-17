import { useMutation } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { likeDocument } from '@/shared/api/likes/likeDocument.ts';

export function useLikeDocument() {
  return useMutation<void, Error, number>({
    mutationFn: likeDocument,
    onSuccess: () => {
      notify({ message: 'Лайк поставлен', severity: 'success' });
    },
    onError: (error) => {
      notify({
        message: error.message || 'Не удалось поставить лайк',
        severity: 'error',
      });
    },
  });
}
