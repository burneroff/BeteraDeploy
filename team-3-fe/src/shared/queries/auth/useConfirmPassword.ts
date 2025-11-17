// src/shared/queries/useConfirmPassword.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api/http/client';
import type { SuccessResponse } from '@/shared/api/http/types';
import type { AuthResponse } from '@/shared/api/auth/types';
import { normalizeAuth } from '@/shared/api/auth/types';
import { authStorage } from '@/shared/api/auth/authStorage';
import { notify } from '@/app/providers/NotificationProvider/notificationService';

type ConfirmPayload = {
  user_id: number;
  token: string;
  password: string;
};

export const useConfirmPassword = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ConfirmPayload) => {
      const resp = await http.post<SuccessResponse<AuthResponse>>(
        '/api/v1/auth/confirm',
        payload
      );
      return normalizeAuth(resp.data);
    },
    onSuccess: ({ accessToken, refreshToken }) => {

      authStorage.saveTokens(accessToken, refreshToken);
      qc.invalidateQueries({ queryKey: ['me'] });
      notify({ message: 'Пароль сохранён. Добро пожаловать!', severity: 'success' });
    },
    onError: (err: any) => {
      notify({
        message: err?.response?.data?.message || err?.message || 'Ошибка при подтверждении пароля',
        severity: 'error',
      });
    },
  });
};
