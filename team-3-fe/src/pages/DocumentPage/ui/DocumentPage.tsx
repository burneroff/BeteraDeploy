import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PlusIcon from '@/shared/components/StyledButton/assets/PlusIcon.tsx';
import { Title } from '@/shared/components/Title';
import { StyledButton } from '@/shared/components/StyledButton';
import { DataGridDocuments, useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { PopupDocuments } from '@/features/PopupDocuments';
import theme from '@/app/theme/theme.tsx';
import DeleteDocumentButton from '@/features/document-delete/DeleteDocumentButton.tsx';
import { SearchDocument } from '@/features/document-search/SearchDocument.tsx';
import AdminOnlyStaff from '@/features/admin-only-staff/AdminOnlyStaff.tsx';
import AdminStaff from '@/features/admin-staff/AdminStaff.tsx';

export const DocumentPage = () => {
  const setPopupOpen = useDocumentsGridStore((state) => state.setPopupOpen);

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
      <Title text="Документы" />

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 12, md: 'grow' }}>
          <SearchDocument />
        </Grid>

        <Grid size={{ xs: 12, sm: 'auto', md: 'auto' }}>
          <AdminStaff>
            <StyledButton
              fullWidth
              sx={{ height: '36px', minWidth: '193px' }}
              text="Добавить документ"
              onClick={() => setPopupOpen(true)}
              startIcon={<PlusIcon />}
            />
          </AdminStaff>
        </Grid>
        <AdminOnlyStaff>
          <Grid size={{ xs: 12, sm: 'auto', md: 'auto' }}>
            <DeleteDocumentButton />
          </Grid>
        </AdminOnlyStaff>
      </Grid>

      <DataGridDocuments />
      <AdminStaff>
        <PopupDocuments />
      </AdminStaff>
    </Box>
  );
};
