import { http } from '../http/client';
import type { Comment } from '@/shared/api/comments/types';

export const getComments = async (documentId?: number) => {
  if (!documentId) return [];
  const { data } = await http.get<Comment[]>(`/api/v1/documents/${documentId}/comments`);
  return data;
};
