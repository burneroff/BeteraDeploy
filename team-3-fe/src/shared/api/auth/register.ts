// src/shared/api/auth/register.ts
import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { AuthResponse, NormalizedAuth } from './types';
import { normalizeAuth } from './types';

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
};

export const registerUser = async (payload: RegisterPayload): Promise<NormalizedAuth> => {
  const body = { ...payload, role_id: Number(payload.role_id) };
  const resp = await http.post<SuccessResponse<AuthResponse>>('/api/v1/auth/register', body);
  return normalizeAuth(resp.data);
};
