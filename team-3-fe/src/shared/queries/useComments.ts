import { useQuery } from '@tanstack/react-query';
import { getComments } from '@/shared/api/comments/getComments';

export function useComments(documentId?: number) {
  return useQuery({
    queryKey: ['comments', documentId],
    queryFn: () => getComments(documentId),
    enabled: !!documentId, // запрос выполняется только если documentId задан
  });
}
