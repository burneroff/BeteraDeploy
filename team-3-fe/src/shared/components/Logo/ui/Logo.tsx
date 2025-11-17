import { Box, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useResponsiveLogo } from '../model/useResponsiveLogo';

export const Logo = () => {
  const { LogoComponent, logoSize } = useResponsiveLogo();

  return (
    <MuiLink component={RouterLink} to="/" underline="none" sx={{ display: 'flex' }}>
      <Box sx={{ width: logoSize, height: '100%', display: "flex" }}>
        <LogoComponent width="100%" />
      </Box>
    </MuiLink>
  );
};
