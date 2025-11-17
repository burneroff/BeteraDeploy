import { Box } from '@mui/material';
import { RoleSelect } from '@/shared/components/RoleSelect';
import type { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { DataGridTemplate } from '@/shared/components/DataGridTemplate';
import { useAdminGridStore } from '../model/store.ts';
import { CustomColumnHeader } from '@/shared/components/DataGridTemplate/ui/CustomColumnHeader.tsx';
import { useEffect, useState } from 'react';
import { useResendVerification } from '@/shared/queries/index.ts';
import CheckIcon from '@/shared/icons/CheckIcon.tsx';
import { StyledButton } from '@/shared/components/StyledButton/index.ts';

export const DataGridAdmin = () => {
  const {
    filteredRows,
    handleRoleChange,
    rowSelectionModel,
    setRowSelectionModel,
    fetchUsers,
    isLoading,
  } = useAdminGridStore();
  const [resendingId, setResendingId] = useState<number | null>(null);
  const resendMutation = useResendVerification();
  useEffect(() => {
    fetchUsers();
    return () => {
      setRowSelectionModel({
        type: 'include',
        ids: new Set<number>(),
      });
    };
  }, [setRowSelectionModel]);

  const handleRowClick = (params: GridRowParams) => {
    const newIds = new Set(rowSelectionModel.ids);
    const rowId = params.id as number;

    if (newIds.has(rowId)) {
      newIds.delete(rowId);
    } else {
      newIds.add(rowId);
    }

    setRowSelectionModel({
      ...rowSelectionModel,
      ids: newIds,
    });
  };
  const handleResend = (user_id: number, email: string) => {
    setResendingId(user_id);
    resendMutation.mutate(
      { user_id, email },
      {
        onSettled: () => setResendingId(null),
      },
    );
  };
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'first_name',
      headerName: 'Имя',
      width: 250,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'last_name',
      headerName: 'Фамилия',
      width: 250,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'role_id',
      headerName: 'Роль',
      width: 250,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            width: '200px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RoleSelect
            id={`role-select-${params.id}`}
            value={Number(params.value) || 0}
            height="24px"
            sx={{
              '& .MuiOutlinedInput-root': { height: '24px !important' },
              '& .MuiSelect-select': {
                padding: '2px 28px 2px 8px !important',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiSelect-icon': {
                width: '20px',
                height: '20px',
                top: '10%',
                left: '84%',
              },
            }}
            fontSize="12px"
            onChange={(value) => handleRoleChange(Number(params.id), value)}
          />
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Почта',
      width: 250,
      sortable: false,
      resizable: false,
      renderHeader: (p) => <CustomColumnHeader {...p} />,
    },
    {
      field: 'isVerified',
      headerName: 'Подтверждение',
      width: 250,
      sortable: false,
      resizable: false,
      type: 'boolean',
      align: 'center', // центрирует содержимое ячеек
      renderHeader: (p) => <CustomColumnHeader {...p} />,
      renderCell: (params) => {
        const { isVerified, id, email } = params.row as {
          isVerified: boolean;
          id: number;
          email: string;
        };

        if (isVerified) return <CheckIcon />;

        const isLoading = resendingId === id && resendMutation.isPending;

        return (
          <Box sx={{ width: '100px' }}>
            <StyledButton
              text={isLoading ? 'Отправляем' : 'Отправить'}
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleResend(id, email);
              }}
              disabled={isLoading}
              title={isLoading ? 'Отправляем' : 'Отправить письмо повторно'}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <DataGridTemplate
      rows={filteredRows}
      columns={columns}
      loading={isLoading}
      disableRowSelectionExcludeModel
      checkboxSelection
      onRowClick={handleRowClick}
      onRowSelectionModelChange={(newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
      }}
      rowSelectionModel={rowSelectionModel}
      localeText={{
        noRowsLabel: 'Список пуст — начните с добавления пользователя',
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
  );
};
