import * as React from 'react';
import type { GridColumnHeaderParams, GridValidRowModel } from '@mui/x-data-grid';
import { Box, IconButton, Menu } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';
import { AccessFilterIcon } from '@/shared/icons/AccessFilterIcon.tsx';
import FilterSortIcon from '@/shared/icons/FilterSortIcon';
import SortMenuNumbers from '@/shared/components/DataGridTemplate/ui/SortMenuNumbers.tsx';
import SortMenuAlphabet from '@/shared/components/DataGridTemplate/ui/SortMenuAlphabet.tsx';
import FilterMenu from '@/shared/components/DataGridTemplate/ui/FilterMenu.tsx';

type SortDirection = 'asc' | 'desc' | null;

export const CustomColumnHeader = <R extends GridValidRowModel = any>(
  params: GridColumnHeaderParams<R>,
) => {
  const apiRef = useGridApiContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isFilter = params.colDef.field === 'accessible_role';
  const isDate = params.colDef.field === 'created_at';
  const IconComponent = isFilter ? AccessFilterIcon : FilterSortIcon;

  const [currentSort, setCurrentSort] = React.useState<SortDirection>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);

    const sortModel = apiRef.current.getSortModel();
    const current = sortModel.find((s: any) => s.field === params.colDef.field)?.sort ?? null;
    setCurrentSort(current);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (direction: SortDirection) => {
    if (direction) {
      apiRef.current.setSortModel([{ field: params.colDef.field, sort: direction }]);
    } else {
      apiRef.current.setSortModel([]);
    }

    setCurrentSort(direction);

    handleCloseMenu();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <Box component="span" sx={{ fontWeight: '500' }}>
        {params.colDef.headerName}
      </Box>

      <IconButton size="small" onClick={handleOpenMenu} sx={{ ml: '1px', opacity: 1 }}>
        <IconComponent />
      </IconButton>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 186,
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#F2F2FF',
              },
            },
          },
        }}
      >
        <Box sx={{ minWidth: 200, p: 1 }}>
          {/* показываем сорт/фильтр в зависимости от типа */}
          {params.colDef.type === 'string' && !isFilter && !isDate && (
            <SortMenuAlphabet
              field={params.colDef.field}
              currentSort={currentSort}
              onChange={handleSortChange}
            />
          )}
          {params.colDef.type === 'number' ||
            params.colDef.type === 'boolean' ||
            (isDate && !isFilter && (
              <SortMenuNumbers
                field={params.colDef.field}
                currentSort={currentSort}
                onChange={handleSortChange}
              />
            ))}
          {isFilter && (
            <FilterMenu
              field={params.colDef.field}
              filterOptions={[
                'Все сотрудники',
                'Администратор',
                'HR-специалист',
                'Менеджер',
                'Специалист',
              ]}
            />
          )}
        </Box>
      </Menu>
    </Box>
  );
};
