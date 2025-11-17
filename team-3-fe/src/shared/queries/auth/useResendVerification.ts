import { useMutation } from '@tanstack/react-query';
import { resendVerification, type ResendPayload } from '@/shared/api/auth/resendVerification';
import { notify } from '@/app/providers/NotificationProvider/notificationService';

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (payload: ResendPayload) => resendVerification(payload),

    onSuccess: (msg) => {
      notify({
        message: msg || 'Письмо повторно отправлено',
        severity: 'success',
      });
    },

    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Не удалось отправить письмо повторно';

      notify({ message, severity: 'error' });
    },
  });
};
