import { http } from '@/shared/api/http/client';
import type { CreateDocumentUploadDto, DocumentEntity } from './types';

export async function createDocument(dto: CreateDocumentUploadDto): Promise<DocumentEntity> {
  const fd = new FormData();

  const metadata = {
    title: dto.title,
    category_id: dto.category_id,
    accessible_role: dto.accessible_role || 5, // если не передали → 5 (доступ всем)
  };

  fd.append('metadata', JSON.stringify(metadata));
  fd.append('file', dto.file);

  const { data } = await http.post<DocumentEntity>('/api/v1/documents', fd);

  return data;
}
