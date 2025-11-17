import { http } from '../http/client';
import type { Viewer } from '@/shared/api/views/types.ts';

export const getViewers = async (documentId?: number) => {
  if (!documentId) return [];
  const { data } = await http.get<Viewer[]>(`/api/v1/documents/${documentId}/viewers`);
  return data;
};
