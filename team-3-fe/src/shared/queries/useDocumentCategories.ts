// src/shared/queries/useDocumentCategories.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocumentCategories } from '@/shared/api/documentCategory';
import type { DocumentCategory } from '@/shared/api/documentCategory/types';

const queryKey = {
  categories: ['document-categories'] as const,
};

export const ALL_DOCS: DocumentCategory = { id: 1, name: 'Все документы' };

export function useDocumentCategories() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKey.categories,
    queryFn: getDocumentCategories,
    staleTime: 60_000,
  });

  const categories = useMemo<DocumentCategory[]>(() => [ALL_DOCS, ...(data ?? [])], [data]);

  return { categories, isLoading, isFetching, isError, error };
}
