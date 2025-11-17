import { http } from '@/shared/api/http/client';
import { withUserHeaders } from '@/shared/api/http/headers';
import type { Comment } from './types';

export const getCommentById = async (
  documentId: number,
  commentId: number,
  userId: number,
  roleId: number,
) => {
  const { data } = await http.get<Comment>(
    `/api/v1/documents/${documentId}/comments/${commentId}`,
    withUserHeaders(userId, roleId),
  );
  return data;
};
