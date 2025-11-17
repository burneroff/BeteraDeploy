import { Typography, type SxProps, type Theme } from '@mui/material';

interface TitleProps {
  text?: string;
  sx?: SxProps<Theme>;
}

export const Title = ({ text, sx }: TitleProps) => {
  return (
    <Typography
      variant="h1"
      fontSize={{ xs: '23px', sm: '24px', md: '32px' }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
    >
      {text}
    </Typography>
  );
};
