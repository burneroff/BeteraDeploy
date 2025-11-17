import type { User } from '@/shared/api/users/types.ts';

export interface AuthStore {
  user: User | undefined;
  setUser: (user: User) => void;
  logout: () => void;
}
