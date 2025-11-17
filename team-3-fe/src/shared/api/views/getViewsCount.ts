import { http } from '../http/client';
import type { ViewsCount } from '@/shared/api/views/types.ts';

export const getViewsCount = async (documentId?: number) => {
  if (!documentId) return [];
  const { data } = await http.get<ViewsCount>(`/api/v1/documents/${documentId}/views`);
  return data;
};
