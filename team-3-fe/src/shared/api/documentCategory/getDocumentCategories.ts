import { http } from '../http/client';
import type { DocumentCategory } from './types';

export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  const res = await http.get<DocumentCategory[]>('/api/v1/categories');
  return res.data;
};
