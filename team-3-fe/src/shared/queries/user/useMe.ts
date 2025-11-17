import { useQuery } from '@tanstack/react-query';
import { getUserMe } from '@/shared/api/users/getUserMe';
import { withInitials } from '@/shared/lib/user/withInitials';

export const meQueryKey = ['me'] as const;

export const useMe = () => {
  const query = useQuery({
    queryKey: meQueryKey,
    queryFn: getUserMe,
    select: (u) => withInitials(u),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    status: query.status,
  };
};
