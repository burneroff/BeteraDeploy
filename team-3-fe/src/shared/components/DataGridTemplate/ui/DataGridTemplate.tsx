import Box from '@mui/material/Box';
import {
  DataGrid,
  type GridColDef,
  type GridValidRowModel,
  type DataGridProps as MuiDataGridProps,
} from '@mui/x-data-grid';
import theme from '@/app/theme/theme.tsx';

interface DataGridTemplateProps<T extends GridValidRowModel>
  extends Omit<MuiDataGridProps<T>, 'rows' | 'columns'> {
  rows: T[];
  columns: GridColDef<T>[];
  height?: string | number;
  width?: string | number;
}

export const DataGridTemplate = <T extends GridValidRowModel>({
  rows,
  columns,
  sx,
  ...props
}: DataGridTemplateProps<T>) => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid<T>
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnSorting
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        isCellEditable={() => false}
        sx={{
          borderRadius: '16px',
          maxHeight: '75vh',
          [theme.breakpoints.down(600)]: {
            maxHeight: '55vh',
          },
          borderColor: 'var(--divider-default)',
          backgroundColor: 'var(--bg-surface)',
          overflow: 'hidden',
          '--DataGrid-t-color-border-base': 'transparent !important',
          // 🔻 убрать разделители колонок
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },

          // (опционально) убрать правые бордеры ячеек/хедеров
          '& .MuiDataGrid-cell': {
            borderRight: 'none',
            borderColor: 'var(--divider-default)',
            userSelect: 'text',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '.MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'start !important',
            textAlign: 'left',
          },
          '& .MuiDataGrid-columnHeaders': {
            height: '44px',
          },
          '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': {
            borderBottom: '1px solid var(--divider-default)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F2F2FF !important',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeaders:focus-within, & .MuiDataGrid-columnHeaders--withFocus':
            { outline: 'none !important' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell--withFocus':
            { outline: 'none !important' },
          '& .MuiDataGrid-cell--editing': {
            backgroundColor: '#FFFFFF !important',
          },

          '& .MuiCheckbox-root': {
            '&:hover': {
              backgroundColor: 'transparent !important',
            },
          },

          // Неактивный (unchecked) чекбокс
          '& .MuiCheckbox-root:not(.Mui-checked):not(.MuiCheckbox-indeterminate):not(.Mui-disabled) .MuiSvgIcon-root':
            {
              width: 18,
              height: 18,
              marginLeft: '3px',
              backgroundColor: '#E8E8FF', // фон квадрата
              borderRadius: '2px',
              boxSizing: 'border-box', // рамка включена в размер
              padding: 0, // чтобы фон не выходил
              overflow: 'hidden', // обрезает всё лишнее
              backgroundClip: 'padding-box', // гарантирует, что фон не выходит за рамку
            },
          '& .MuiCheckbox-root.Mui-checked .MuiSvgIcon-root': {
            borderRadius: '12px', // скругление
          },
          // Убираем белые “пустоты” внутри
          '& .MuiCheckbox-root:not(.Mui-checked):not(.MuiCheckbox-indeterminate):not(.Mui-disabled) .MuiSvgIcon-root path':
            {
              fill: '#E8E8FF',
            },
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
};
