import { http } from '../http/client';

export const likeDocument = async (documentId: number | undefined) => {
  if (!documentId) return;
  await http.put(`/api/v1/documents/${documentId}/like`);
};
