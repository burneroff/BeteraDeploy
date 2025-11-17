import type { DocumentEntity } from './types';
import { multipartHeaders } from '../http/headers';
import type { SuccessResponse } from '../http/types';
import { http } from '../http/client';

/** Прикрепить файл к документу (field: "file") */
export const uploadDocumentFile = async (id: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);

  const res = await http.post<SuccessResponse<DocumentEntity>>(`/api/v1/documents/${id}/file`, fd, {
    headers: multipartHeaders(),
  });

  return res.data.data; // обновлённый документ
};
