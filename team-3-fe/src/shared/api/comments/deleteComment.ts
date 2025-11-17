import { http } from '../http/client';
import type { Comment } from '@/shared/api/comments/types';

export const deleteComment = async (documentId: number, commentId: number): Promise<void> => {
  await http.delete<Comment>(`/api/v1/documents/${documentId}/comments/${commentId}`);
};
