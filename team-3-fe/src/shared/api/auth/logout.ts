import { http } from '../http/client';
import { authStorage } from './authStorage';

export const logout = async () => {
  const refresh_token = authStorage.getRefreshToken();
  try {
    if (refresh_token) {
      await http.post('/api/v1/auth/logout', { refresh_token });
    }
  } finally {
    authStorage.clear();
  }
};

export const logoutAll = async (userId: number) => {
  try {
    await http.post('/api/v1/auth/logout-all', { user_id: userId });
  } finally {
    authStorage.clear();
  }
};
