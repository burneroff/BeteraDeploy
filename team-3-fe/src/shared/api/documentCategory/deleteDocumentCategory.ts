import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';

export const deleteDocumentCategory = async (id: number): Promise<true> => {
  const res = await http.delete<SuccessResponse<true>>(`/document-categories/${id}`);
  return res.data.data; 
};
