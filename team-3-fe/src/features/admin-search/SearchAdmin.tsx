import { useAdminGridStore } from '@/entities/DataGridAdmin';
import { Search } from '@/shared/components/Search/Search.tsx';

export const SearchAdmin = () => {
  const setSearchQuery = useAdminGridStore((state) => state.setSearchQuery);

  return <Search setSearchQuery={setSearchQuery} />;
};
