import { EditProfileForm } from '@/features/edit-profile/ui/EditProfileForm';
import { Box, Paper } from '@mui/material';
import theme from '@/app/theme/theme.tsx';

export const ProfilePage = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 480,
        [theme.breakpoints.down(1350)]: {
          paddingLeft: "20px",
          paddingRight: "20px"
        }
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: "40px",
          width: '100%',
          maxWidth: 480,
          borderRadius: 3,
          boxShadow: 'none',
          border: '1px solid var(--divider-default)',
        }}
      >
        <EditProfileForm />
      </Paper>
    </Box>
  );
};
