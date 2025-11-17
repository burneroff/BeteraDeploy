// src/shared/api/auth/resendVerification.ts
import { http } from '@/shared/api/http/client';
import type { SuccessResponse } from '@/shared/api/http/types';

export type ResendPayload = {
  user_id: number;
  email: string;
};

export const resendVerification = async (payload: ResendPayload): Promise<string> => {
  const { data } = await http.post<SuccessResponse<unknown>>('/api/v1/auth/resend', payload);
  return data?.message ?? 'Письмо с подтверждением повторно отправлено';
};
