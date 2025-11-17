import { http } from '@/shared/api/http/client';
import { withUserHeaders } from '@/shared/api/http/headers';
import type { LikesCount } from './types';

export const getLikesCount = async (documentId: number, userId: number, roleId: number) => {
  const { data } = await http.get<LikesCount>(
    `/api/v1/documents/${documentId}/likes`,
    withUserHeaders(userId, roleId),
  );
  return data;
};
