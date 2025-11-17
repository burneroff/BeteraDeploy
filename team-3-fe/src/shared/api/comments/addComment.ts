import { http } from '../http/client';
import type { Comment } from '@/shared/api/comments/types';

export const addComment = async (documentId: number, text: string): Promise<void> => {
  await http.post<Comment>(`/api/v1/documents/${documentId}/comments`, { text });
};
