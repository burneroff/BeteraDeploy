import type { SuccessResponse } from '../http/types';
import type { User } from '@/shared/api/users/types.ts';

export interface AuthResponse {
  user: User;
  // сервер может вернуть и в snake, и в camel
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  verified?: boolean;
}

// Унифицированный объект для фронта
export interface NormalizedAuth {
  user: User;
  accessToken: string;
  refreshToken: string;
  verified: boolean;
}

export const normalizeAuth = (res: SuccessResponse<AuthResponse>): NormalizedAuth => {
  const d = res.data;
  return {
    user: d.user,
    accessToken: d.accessToken || d.access_token || '',
    refreshToken: d.refreshToken || d.refresh_token || '',
    verified: d.verified ?? d.user?.isVerified ?? false,
  };
};
