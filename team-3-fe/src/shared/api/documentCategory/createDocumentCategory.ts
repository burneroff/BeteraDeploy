import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { CategoryCreateDto, DocumentCategory } from './types';

export const createDocumentCategory = async (dto: CategoryCreateDto): Promise<DocumentCategory> => {
  const res = await http.post<SuccessResponse<DocumentCategory>>('/api/v1/categories', dto);
  return res.data.data;
};
