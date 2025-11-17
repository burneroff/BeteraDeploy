import { useMutation, useQueryClient } from '@tanstack/react-query';


import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { normalizeAuth, type AuthResponse, type NormalizedAuth } from '@/shared/api/auth/types';
import type { SuccessResponse } from '@/shared/api/http/types';
import { http } from '@/shared/api/http/client';
 

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number; 
};


export const useRegister = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (payload: RegisterPayload): Promise<NormalizedAuth> => {

      const body: RegisterPayload = {
        ...payload,
        role_id: Number(payload.role_id),
      };

      const resp = await http.post<SuccessResponse<AuthResponse>>(
        '/api/v1/auth/register',
        body
      );
      return normalizeAuth(resp.data);
    },

    onSuccess: () => {
      notify({ message: 'Пользователь успешно зарегистрирован', severity: 'success' });
      qc.invalidateQueries({ queryKey: ['users'] }).catch(() => {});
    },

    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Не удалось зарегистрировать пользователя';
      notify({ message: msg, severity: 'error' });
    },
  });
};
