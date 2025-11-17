// src/shared/queries/useCreateDocument.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { createDocument, type CreateDocumentUploadDto, type DocumentEntity } from '@/shared/api/documents';
 

export function useCreateDocument() {
  const qc = useQueryClient();

  return useMutation<DocumentEntity, Error, CreateDocumentUploadDto>({
    mutationFn: createDocument,
    onSuccess: () => {
      notify({ message: 'Документ добавлен', severity: 'success' });
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (e) => {
      notify({ message: e.message || 'Не удалось загрузить документ', severity: 'error' });
    },
  });
}
