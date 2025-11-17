import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { DocumentEntity } from './types';

/** Получить один документ по id */
export const getDocumentById = async (id: number) => {
  const res = await http.get<SuccessResponse<DocumentEntity>>(`/api/v1/documents/${id}`);
  return res.data.data;
};
