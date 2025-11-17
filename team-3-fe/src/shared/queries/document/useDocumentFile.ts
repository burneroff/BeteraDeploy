import { useMutation } from '@tanstack/react-query';
 
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { getDocumentFile } from '@/shared/api/documents';

export function useDocumentFile() {
  return useMutation({
    mutationFn: (id: number) => getDocumentFile(id),
    onError: (e: any) => {
      notify({ message: e?.message ?? 'Не удалось скачать файл', severity: 'error' });
    },
  });
}
