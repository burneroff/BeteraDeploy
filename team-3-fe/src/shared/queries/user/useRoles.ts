import { useQuery } from '@tanstack/react-query';
import { getRoles } from '@/shared/api/roles/getRoles';
import type { Role } from '@/shared/api/roles/types';

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: getRoles,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
