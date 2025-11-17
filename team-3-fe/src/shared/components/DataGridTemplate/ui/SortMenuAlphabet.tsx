import * as React from 'react';
import { MenuItem, Box } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';
import FilterA from '@/shared/icons/FilterA.tsx';
import { FilterYA } from '@/shared/icons/FilterYA.tsx';
import FilterDefault from '@/shared/icons/FilterDefault.tsx';

type SortDirection = 'asc' | 'desc' | null;

interface Props {
  field: string;
  currentSort: SortDirection;
  onChange?: (direction: SortDirection) => void;
  hideMenu?: (e: React.MouseEvent) => void;
}

/**
 * Сортировка для строк (А→Я, Я→А, По умолчанию)
 */
export const SortMenuAlphabet: React.FC<Props> = ({ field, currentSort, onChange, hideMenu }) => {
  const apiRef = useGridApiContext();

  const options = [
    { label: 'от А до Я', icon: <FilterA />, sort: 'asc' as const },
    { label: 'от Я до А', icon: <FilterYA />, sort: 'desc' as const },
    { label: 'По умолчанию', icon: <FilterDefault />, sort: null as SortDirection },
  ];

  const handleClick = (e: React.MouseEvent, sort: SortDirection) => {
    if (sort) {
      apiRef.current.setSortModel([{ field, sort }]);
    } else {
      apiRef.current.setSortModel([]); // "По умолчанию" — очистка сортировки
    }
    onChange?.(sort);
    if (hideMenu) hideMenu(e);
  };

  return (
    <>
      {options.map(({ label, icon, sort }) => {
        const isActive = sort === currentSort || (sort === null && currentSort === null);
        return (
          <MenuItem
            key={label}
            onClick={(e) => handleClick(e, sort)}
            sx={{
              width: 'auto',
              height: '36px',
              backgroundColor: isActive ? '#E8E8FF' : 'transparent',
            }}
          >
            <Box
              sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
            >
              {icon}
              {label}
            </Box>
          </MenuItem>
        );
      })}
    </>
  );
};

export default SortMenuAlphabet;
