import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { AuthResponse, NormalizedAuth } from './types';
import { normalizeAuth } from './types';

export const confirmPassword = async (user_id: number, token: string, password: string): Promise<NormalizedAuth> => {
  const resp = await http.post<SuccessResponse<AuthResponse>>('/auth/confirm', { user_id, token, password });
  return normalizeAuth(resp.data);
};
