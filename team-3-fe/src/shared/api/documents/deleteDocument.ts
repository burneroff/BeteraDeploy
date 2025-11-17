import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';

export const deleteDocument = async (id: number) => {
  const res = await http.delete<SuccessResponse<true>>(`/api/v1/documents/${id}/`);
  return res.data.data; // true
};
