import { http } from '../http/client';

export const unLikeDocument = async (documentId: number | undefined) => {
  if (!documentId) return;
  await http.delete(`/api/v1/documents/${documentId}/like`);
};
