import { http } from "../http/client";

export const getDocumentFile = async (id: number) => {
  const res = await http.get<Blob>(`/api/v1/documents/${id}/file`, {
    responseType: 'blob',
  });
  return res.data;
};
