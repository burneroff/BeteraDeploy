import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { DocumentEntity, UpdateDocumentDto } from './types';

export const updateDocument = async (id: number, dto: UpdateDocumentDto) => {
  const res = await http.patch<SuccessResponse<DocumentEntity>>(`/api/v1/documents/${id}`, dto);
  return res.data.data;
};
