import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        bgcolor: 'var(--tertiary-default)',
      }}
    >
      <Typography variant="h1" sx={{ color: '#5E5FDB' }}>
        404
      </Typography>
      <Typography variant="h5">Страница не найдена</Typography>
      <Typography variant="body1" sx={{ maxWidth: 400, color: '#555' }}>
        Похоже, вы перешли по неверной ссылке или страница была удалена.
      </Typography>
      <Button
        variant="contained"
        sx={{
          mt: 2,
          backgroundColor: '#5E5FDB',
          borderRadius: '12px',
          textTransform: 'none',
          px: 3,
          '&:hover': { backgroundColor: 'var(--primary-300)' },
        }}
        onClick={() => navigate('/admin')}
      >
        На главную
      </Button>
    </Box>
  );
};

export default NotFoundPage;
