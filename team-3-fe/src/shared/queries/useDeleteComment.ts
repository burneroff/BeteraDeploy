import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { deleteComment } from '@/shared/api/comments/deleteComment';
import type { Comment, DeleteCommentParams } from '@/shared/api/comments/types';

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteCommentParams>({
    mutationFn: ({ documentId, commentId }) => deleteComment(documentId, commentId),

    onSuccess: (_, { documentId, commentId }) => {
      queryClient.setQueryData<Comment[]>(['comments', documentId], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((comment) => comment.id !== commentId);
      });

      notify({ message: 'Комментарий удален', severity: 'success' });
    },

    onError: (error) => {
      notify({
        message: error.message || 'Не удалось удалить комментарий',
        severity: 'error',
      });
    },
  });
}
