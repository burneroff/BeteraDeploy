import type { User } from '@/shared/api/users/types.ts';

export type UserWithInitials = User & { initials?: string };

export const withInitials = (user: User): UserWithInitials => {
  if (!user?.photoPath) {
    const first = user.first_name?.[0]?.toUpperCase() ?? '';
    const last = user.last_name?.[0]?.toUpperCase() ?? '';
    return { ...user, initials: `${first}${last}` };
  }
  return user;
};
