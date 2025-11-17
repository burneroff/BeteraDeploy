import { getDocuments, type DocumentEntity } from '@/shared/api/documents';
import { useQuery } from '@tanstack/react-query';
 

export function useDocuments(enabled: boolean = true) {
  return useQuery<DocumentEntity[]>({
    queryKey: ['documents'],
    queryFn: getDocuments,
    enabled: !!enabled,
    staleTime: 60_000,
  });
}
