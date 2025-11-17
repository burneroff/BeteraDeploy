import Box from '@mui/material/Box';
import PlusIcon from '@/shared/components/StyledButton/assets/PlusIcon.tsx';
import { Title } from '@/shared/components/Title';
import { StyledButton } from '@/shared/components/StyledButton';
import { DataGridAdmin, useAdminGridStore } from '@/entities/DataGridAdmin';
import { Popup } from '@/features/Popup';
import { Grid } from '@mui/material';
import theme from '@/app/theme/theme.tsx';
import DeleteUserButton from '@/features/admin-delete-user/DeleteUserButton.tsx';
import { SearchAdmin } from '@/features/admin-search/SearchAdmin.tsx';

export const AdminPage = () => {
  const setPopupOpen = useAdminGridStore((state) => state.setPopupOpen);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '92vh',
        paddingBottom: '40px',
        paddingLeft: '20px',
        paddingTop: '15px',
        [theme.breakpoints.down(1350)]: {
          paddingLeft: '0px',
          paddingTop: '0px',
          height: '89vh',
        },
      }}
    >
      <Title text={'Администрирование'} />
      <Grid container spacing={2} alignItems="center">
        <Box sx={{ flex: 1 }}>
          <SearchAdmin />
        </Box>
        <Grid size={{ xs: 12, sm: 'auto', md: 'auto' }}>
          <StyledButton
            text="Добавить пользователя"
            variant="outlined"
            onClick={() => setPopupOpen(true)}
            startIcon={<PlusIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 'auto', md: 'auto' }}>
          <DeleteUserButton />
        </Grid>
      </Grid>
      <DataGridAdmin />
      <Popup />
    </Box>
  );
};
