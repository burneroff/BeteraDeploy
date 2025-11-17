import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { AuthResponse, NormalizedAuth } from './types';
import { normalizeAuth } from './types';

export const loginUser = async (email: string, password: string): Promise<NormalizedAuth> => {
  const resp = await http.post<SuccessResponse<AuthResponse>>('/api/v1/auth/login', { email, password });
  return normalizeAuth(resp.data);
};

export const logoutAll = async (): Promise<void> => {
  await http.post('/api/v1/user/logout-all');
};