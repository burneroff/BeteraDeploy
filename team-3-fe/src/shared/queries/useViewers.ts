import { useQuery } from '@tanstack/react-query';
import { getViewers } from '@/shared/api/views/getViewers.ts';

export function useViewers(documentId?: number) {
  return useQuery({
    queryKey: ['viewers', documentId],
    queryFn: () => getViewers(documentId),
    enabled: !!documentId, // запрос выполняется только если documentId задан
  });
}
