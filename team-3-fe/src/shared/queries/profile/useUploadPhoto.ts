import { useMutation } from '@tanstack/react-query';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { uploadUserPhoto } from '@/shared/api/users/uploadPhoto';
 

export const useUploadPhoto = () => {
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadUserPhoto(id, file),
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка загрузки фото';
      notify({ message: msg, severity: 'error' });
    },
  });
};
