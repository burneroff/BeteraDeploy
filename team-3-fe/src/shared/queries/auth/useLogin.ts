import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/shared/api/auth/login';
import { authStorage } from '@/shared/api/auth/authStorage';
import { useAuthStore } from '@/entities/user/model/store';
import { notify } from '@/app/providers/NotificationProvider/notificationService';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),

    onSuccess: async ({ accessToken, refreshToken, verified, user }) => {
      // 1. Сохраняем токены
      authStorage.saveTokens(accessToken, refreshToken);

      // 2. Обновляем Zustand store пользователя
      if (user) {
        useAuthStore.getState().setUser(user);
      }
      console.log(useAuthStore.getState());
      // 4. Уведомление
      notify({ message: 'Авторизация прошла успешно!', severity: 'success' });

      return { verified };
    },

    onError: (err: any) => {
      notify({
        message: err?.response?.data?.message || err?.message || 'Ошибка авторизации',
        severity: 'error',
      });
    },
  });
};
