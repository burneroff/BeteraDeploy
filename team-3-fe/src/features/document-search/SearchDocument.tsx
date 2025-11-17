import { Search } from '@/shared/components/Search/Search.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';

export const SearchDocument = () => {
  const setSearchQuery = useDocumentsGridStore((state) => state.setSearchQuery);

  return <Search setSearchQuery={setSearchQuery} />;
};
