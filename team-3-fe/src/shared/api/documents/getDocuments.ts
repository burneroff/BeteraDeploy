import { http } from '../http/client';
import type { RequestDocumentEntinty } from './types';

export async function getDocuments() {
  const res = await http.get<RequestDocumentEntinty>('/api/v1/documents');
  return res.data.documents;
}
