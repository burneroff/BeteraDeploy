// src/shared/queries/useGenerateAvatar.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { generateAvatar } from '@/shared/api/users/generateAvatar';
 

export const useGenerateAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => generateAvatar(),
    onSuccess: async ({  }) => {
      notify({ message: 'Аватар сгенерирован', severity: 'success' });
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка генерации аватара';
      notify({ message: msg, severity: 'error' });
    },
  });
};
