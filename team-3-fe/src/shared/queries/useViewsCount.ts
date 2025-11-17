import { useQuery } from '@tanstack/react-query';
import { getViewsCount } from '@/shared/api/views/getViewsCount.ts';

export function useViewsCount(documentId?: number) {
  return useQuery({
    queryKey: ['views-count', documentId],
    queryFn: () => getViewsCount(documentId),
    enabled: !!documentId, // запрос выполняется только если documentId задан
  });
}
