// src/shared/queries/useUpdateProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { updateProfile } from '@/shared/api/users/updateProfile';
import type { UpdateProfilePayload } from '@/shared/api/users/types';
 

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: async () => {
      notify({ message: 'Профиль обновлён', severity: 'success' });
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка при сохранении профиля';
      notify({ message: msg, severity: 'error' });
    },
  });
};
