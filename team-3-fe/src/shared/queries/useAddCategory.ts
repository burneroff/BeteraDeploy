// src/shared/queries/useCreateDocumentCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { createDocumentCategory } from '@/shared/api/documentCategory';
import type { CategoryCreateDto, DocumentCategory } from '@/shared/api/documentCategory';

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation<DocumentCategory, Error, CategoryCreateDto>({
    mutationFn: createDocumentCategory,
    onSuccess: (newCategory) => {
      notify({ message: 'Категория успешно добавлена', severity: 'success' });

      // Обновляем кэш категорий в react-query
      queryClient.setQueryData<DocumentCategory[]>(['categories'], (old = []) => [
        ...old,
        newCategory,
      ]);
    },
    onError: (error) => {
      notify({
        message: error.message || 'Не удалось добавить категорию',
        severity: 'error',
      });
    },
  });
}
