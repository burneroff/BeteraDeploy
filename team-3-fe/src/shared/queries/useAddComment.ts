import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { addComment } from '@/shared/api/comments/addComment';

export function useAddComment(documentId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (text: string) => addComment(documentId, text),
    onSuccess: () => {
      notify({ message: 'Комментарий добавлен', severity: 'success' });

      // Запрос всех комментариев заново
      queryClient.invalidateQueries({ queryKey: ['comments', documentId] });
    },
    onError: (error: Error) => {
      notify({ message: error.message || 'Не удалось добавить комментарий', severity: 'error' });
    },
  });
}
