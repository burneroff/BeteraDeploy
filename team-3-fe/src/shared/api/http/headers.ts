import { authStorage } from '../auth/authStorage';

export const withUserHeaders = (userId: number, roleId: number) => ({
  headers: {
    Authorization: `Bearer ${authStorage.getAccessToken()}`,
    'X-User-ID': userId.toString(),
    'X-Role-ID': roleId.toString(),
  },
});

export const multipartHeaders = () => ({
  'Content-Type': 'multipart/form-data',
});
