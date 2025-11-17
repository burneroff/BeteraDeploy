import type {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowParams,
  GridValueGetter,
} from '@mui/x-data-grid';
import { DataGridTemplate } from '@/shared/components/DataGridTemplate/ui/DataGridTemplate';
import { PopupTwoSection } from '@/widgets/PopupTwoSection/ui/PopupTwoSection.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { CustomColumnHeader } from '@/shared/components/DataGridTemplate/ui/CustomColumnHeader';
import Box from '@mui/material/Box';
import { Avatar, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useAuthStore } from '@/entities/user/model/store.ts';
import { isAdminOrStaff } from '@/features/admin-staff/AdminStaff.tsx';
import type { DocumentEntity } from '@/shared/api/documents';

export const DataGridDocuments = () => {
  const {
    filteredRows,
    fetchDocuments,
    setOpenPdf,
    setSelectedRow,
    rowSelectionModel,
    setRowSelectionModel,
    isLoading,
  } = useDocumentsGridStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchDocuments();
    return () => {
      setRowSelectionModel({
        type: 'include',
        ids: new Set<number>(),
      });
    };
  }, [setRowSelectionModel]);

  const handleRowClick = (params: GridRowParams<DocumentEntity>) => {
    setSelectedRow(params.row);
    setOpenPdf(true);
  };

  const accessibleRoleColumn: GridColDef<DocumentEntity, string> = {
    field: 'accessible_role',
    headerName: 'Доступен',
    width: 190,
    sortable: true,
    resizable: false,
    valueGetter: ((value, row) => row.accessible_role?.name ?? `${value}`) as GridValueGetter<
      DocumentEntity,
      string
    >,
    renderHeader: (p: GridColumnHeaderParams<DocumentEntity>) => <CustomColumnHeader {...p} />,
    renderCell: (p: GridRenderCellParams<DocumentEntity, string>) => p.value ?? '',
  };

  const columns: GridColDef<DocumentEntity>[] = [
    {
      field: 'title',
      headerName: 'Название документа',
      width: 220,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'full_name',
      headerName: 'Добавил',
      width: 200,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar
            src={params.row.photo_path || undefined}
            alt="userImage"
            variant="rounded"
            sx={{
              width: 24,
              height: 24,
              background: '#E8E8FF',
              borderRadius: '6px',
              color: '#16122C',
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
            }}
          />
          <Typography
            variant="body2"
            sx={{ marginLeft: '4px', fontSize: '14px', color: '#16122C' }}
          >
            {params.row.first_name + ' ' + params.row.last_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Дата добавления документа',
      width: 240,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (params) => {
        const date = new Date(params.value);
        const datePart = date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const timePart = date.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return `${datePart} ${timePart}`;
      },
    },
    {
      field: 'category_id',
      headerName: 'Категория документа',
      width: 190,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (p: GridRenderCellParams<DocumentEntity>) => {
        return p.row.category.name;
      },
    },
    ...(isAdminOrStaff(user) ? [accessibleRoleColumn] : []),
    {
      field: 'likes_count',
      headerName: 'Лайки',
      width: 100,
      type: 'number',
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'comments_count',
      headerName: 'Комментарии',
      width: 140,
      type: 'number',
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'is_viewed',
      headerName: 'Ознакомлен',
      width: 180,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (p: GridRenderCellParams<DocumentEntity>) => {
        return p.row.is_viewed ? 'Ознакомлен' : 'Не ознакомлен';
      },
    },
  ];

  return (
    <>
      <DataGridTemplate
        rows={filteredRows}
        columns={columns}
        loading={isLoading}
        disableRowSelectionExcludeModel
        checkboxSelection
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        onRowClick={handleRowClick}
        localeText={{
          noRowsLabel: 'Список пуст — начните с добавления документа',
          noResultsOverlayLabel: 'Список пуст — ничего не найдено',
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            cursor: 'pointer',
            borderColor: 'var(--divider-default)', // dividerColor
            display: 'flex',
            justifyContent: 'start',
          },
        }}
      />
      <PopupTwoSection />
    </>
  );
};
