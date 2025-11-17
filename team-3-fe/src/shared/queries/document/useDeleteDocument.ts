// src/shared/queries/useDocuments.ts
import { useMutation } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { deleteDocument } from '@/shared/api/documents';
 

/** Удалить только файл у документа */
export function useDeleteDocument() {
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      notify({ message: 'Файл удалён', severity: 'success' });
    },
    onError: (e: any) => {
      notify({ message: e?.message ?? 'Не удалось удалить файл', severity: 'error' });
    },
  });
}
