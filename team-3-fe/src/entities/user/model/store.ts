import { create } from 'zustand';
import type { AuthStore } from '@/entities/user/model/types.ts';

export const useAuthStore = create<AuthStore>((set) => ({
  user: undefined, // изначально нет пользователя

  /** Установить пользователя (логин/обновление профиля) */
  setUser: (user) =>
    set(() => {
      const initials =
        (user.first_name?.[0] || '').toUpperCase() + (user.last_name?.[0] || '').toUpperCase();

      return { user: { ...user, initials } };
    }),

  /** Выйти из системы */
  logout: () => set({ user: undefined }),
}));
