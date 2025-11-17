import { http } from '../http/client';
import type { ViewPost } from '@/shared/api/views/types.ts';

export const markViewed = async (documentId: number): Promise<void> => {
  await http.put<ViewPost>(`/api/v1/documents/${documentId}/view`);
};
